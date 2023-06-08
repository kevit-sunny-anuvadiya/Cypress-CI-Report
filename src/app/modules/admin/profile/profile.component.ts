import {
    Component,
    HostListener,
    OnDestroy,
    OnInit,
    TemplateRef
} from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../core/user/user.service';
import { NotificationService } from '../../../../@fuse/services/notification/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { HTMLInputEvent } from '../../../core/user/user.types';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { CountdownEvent } from 'ngx-countdown';
import { FuseValidators } from '../../../../@fuse/validators';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
    isOpened = true;
    sidebarMode = 'side';
    public checkEnable = false;
    public activeTabs = 'PROFILE_INFORMATION';
    public profileTabs = [
        {
            name: 'PROFILE_INFORMATION',
            dis: 'MANAGE_PROFILE_INFO',
            isActive: true,
            iconName: 'account_circle'
        },
        {
            name: 'SECURITY',
            dis: 'SECURITY_INFO',
            isActive: false,
            iconName: 'lock'
        },
        {
            name: 'DELETE_PROFILE',
            dis: 'DELETE_INFO',
            isActive: false,
            iconName: 'delete'
        }
    ];
    public dialogRef;
    public deleteMessage = '';
    public TFAImage: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isLoading = true;
    isProfileEdit;
    isUpdating;
    isEnable;
    enableAuthentication: number | string;
    sendVerification: number;
    profileImage;
    isVerify = true;
    openVerificationModal = false;
    reSendOTP = false;
    isEmailAvailable = false;
    profileForm = this._formBuilder.group({
        profilePic: [''],
        language: [''],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
    });
    deleteProfileForm = this._formBuilder.group({
        password: [
            '',
            [
                Validators.required,
                Validators.pattern(
                    `^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-._;"():'=]).{8,}$`
                )
            ]
        ]
    });
    passwordForm = this._formBuilder.group(
        {
            password: [
                '',
                [
                    Validators.required,
                    Validators.pattern(
                        `^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-._;"():'=]).{8,}$`
                    )
                ]
            ],
            newPassword: [
                '',
                [
                    Validators.required,
                    Validators.pattern(
                        `^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-._;"():'=]).{8,}$`
                    )
                ]
            ],
            reEnterPassword: [
                '',
                [
                    Validators.required,
                    Validators.pattern(
                        '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.-;"():]).{8,}$'
                    )
                ]
            ]
        },
        {
            validators: FuseValidators.mustMatch(
                'newPassword',
                'reEnterPassword'
            )
        }
    );
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _userService: UserService,
        private readonly notificationService: NotificationService,
        private readonly translationService: TranslateService,
        private dialog: MatDialog,
        private _authService: AuthService,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this.getUserDetails();
        this.onResize(window.innerWidth);
    }

    @HostListener('window:resize', ['$event.target.innerWidth'])
    private onResize(width: number) {
        if (!(width >= 960)) {
            this.isOpened = false;
            this.sidebarMode = 'over';
        } else {
            this.isOpened = true;
            this.sidebarMode = 'side';
        }
    }
    private getUserDetails(): void {
        this._userService
            .get()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (user) => {
                    this.isEnable = user?.isTFAEnable;
                    this.checkEnable = user?.isTFAEnable;
                    this.profileForm.patchValue({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        language: user.language,
                        profilePic: user?.profilePic
                    });
                    const userDetails = JSON.parse(
                        localStorage.getItem('user')
                    );
                    userDetails.profilePic = user?.profilePic;
                    localStorage.setItem('user', JSON.stringify(userDetails));
                    this.isLoading = false;
                    this.profileForm.get('email').valueChanges.subscribe({
                        next: (event) => {
                            if (
                                JSON.parse(localStorage.getItem('user'))
                                    .email !== event
                            ) {
                                this.isVerify = false;
                            } else {
                                this.isVerify = true;
                            }
                        }
                    });
                },
                error: (err) => {
                    this.notificationService.showNotification(
                        'error',
                        this.translationService.instant(
                            err.error?.error || 'SOMETHING_WENT_WRONG'
                        )
                    );
                }
            });
    }

    public updateUserDetails(_isProfileUpdate = false): void {
        this.isUpdating = true;
        const updatedUserData = JSON.parse(
            JSON.stringify(this.profileForm.value)
        );
        updatedUserData.profilePic = this.profileImage;
        updatedUserData.otp = this.sendVerification;
        if (!_isProfileUpdate) {
            delete updatedUserData.profilePic;
        }
        this._userService
            .update(updatedUserData)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.notificationService.showNotification(
                        'success',
                        this.translationService.instant(
                            'USER_INFORMATION_HAS_BEEN_SUCCESSFULLY_UPDATED'
                        )
                    );
                    const userInfo = JSON.parse(localStorage.getItem('user'));
                    userInfo.firstName = this.profileForm.value.firstName;
                    userInfo.lastName = this.profileForm.value.lastName;
                    userInfo.email = this.profileForm.value.email;
                    userInfo.language = this.profileForm.value.language;
                    userInfo.profilePic = this.profileForm.value.profilePic;
                    localStorage.setItem('user', JSON.stringify(userInfo));
                    this.getUserDetails();
                    this.isProfileEdit = false;
                    this.isUpdating = false;
                    this.translationService.use(
                        this.profileForm.value.language
                    );
                    this.openVerificationModal = false;
                },
                error: (err) => {
                    if (
                        err.error.error === 'OTP_EXPIRED' ||
                        err.error.error === 'INVALID_OTP'
                    ) {
                        this.sendVerification = null;
                        this.reSendOTP = true;
                    }
                    this.notificationService.showNotification(
                        'error',
                        this.translationService.instant(
                            err.error?.error || 'SOMETHING_WENT_WRONG'
                        )
                    );
                    this.isUpdating = false;
                }
            });
    }

    public changePassword(): void {
        if (
            this.passwordForm.value.newPassword !==
            this.passwordForm.value.reEnterPassword
        ) {
            return this.notificationService.showNotification(
                'error',
                this.translationService.instant(
                    'PASSWORD_NOT_MATCH_PLEASE_RE_ENTER_YOUR_PASSWORD'
                )
            );
        }
        const updatePasswordObj = {
            oldPassword: this.passwordForm.value.password,
            newPassword: this.passwordForm.value.newPassword,
            confirmPassword: this.passwordForm.value.reEnterPassword
        };
        this._userService
            .updatePassword(updatePasswordObj)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.notificationService.showNotification(
                        'success',
                        response.message
                    );
                    this.passwordForm.reset();
                },
                error: (err) => {
                    this.notificationService.showNotification(
                        'error',
                        this.translationService.instant(
                            err.error?.error || 'SOMETHING_WENT_WRONG'
                        )
                    );
                }
            });
    }

    uploadFile(event: HTMLInputEvent): void {
        if (!event.target.accept.includes(event.target.files[0].type)) {
            this.notificationService.showNotification(
                'error',
                this.translationService.instant('FILE_TYPES')
            );
            return;
        }
        if (event.target.files[0].size > 400000) {
            this.notificationService.showNotification(
                'error',
                this.translationService.instant('FST_REQ_FILE_TOO_LARGE')
            );
            return;
        }
        this.isProfileEdit = true;
        const formData = new FormData();
        Array.from(event.target.files).forEach((f) =>
            formData.append('file', f)
        );
        this._userService
            .fileUploadEvent(formData)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (value) => {
                    this.profileImage = value.url;
                    this.updateUserDetails(true);
                },
                error: (err) => {
                    this.notificationService.showNotification(
                        'error',
                        this.translationService.instant(
                            err.error?.error || 'SOMETHING_WENT_WRONG'
                        )
                    );
                    this.isProfileEdit = false;
                }
            });
    }

    sendOTP(): void {
        if (
            JSON.parse(localStorage.getItem('user')).email ===
            this.profileForm.value.email
        ) {
            this.updateUserDetails();
            return;
        }
        this._authService
            .sendCode({
                email: this.profileForm.value.email
            })
            .subscribe({
                next: () => {
                    this.openVerificationModal = true;
                    this.isVerify = true;
                },
                error: (err) => {
                    this.notificationService.showNotification(
                        'error',
                        this.translationService.instant(
                            err.error?.error || 'SOMETHING_WENT_WRONG'
                        )
                    );
                }
            });
    }

    public checkEmail(): void {
        this.isUpdating = true;
        if (
            JSON.parse(localStorage.getItem('user')).email ===
            this.profileForm.value.email
        ) {
            this.isUpdating = false;
            return;
        }
        this.sendVerification = null;
        if (this.isVerify) {
            this.updateUserDetails();
            return;
        }
        if (
            !this.profileForm.value?.email.trim() ||
            this.profileForm.get('email').hasError('email')
        ) {
            return;
        }
        this._authService
            .checkMail({
                email: this.profileForm.value.email
            })
            .subscribe({
                next: (response) => {
                    this.isEmailAvailable = response.isAvailable;
                    this.isUpdating = false;
                    if (!response.isAvailable) {
                        this.notificationService.showNotification(
                            'error',
                            this.translationService.instant(
                                'THIS_EMAIL_IS_ALREADY_TAKEN_PLEASE_CHANGE_EMAIL_AND_TRY_AGAIN'
                            )
                        );
                        this.isUpdating = true;
                    }
                },
                error: (err) => {
                    this.notificationService.showNotification(
                        'error',
                        this.translationService.instant(
                            err.error?.error || 'SOMETHING_WENT_WRONG'
                        )
                    );
                    this.isUpdating = true;
                }
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    checkCountdown(event: CountdownEvent) {
        if (event.action === 'done') {
            this.reSendOTP = true;
        }
    }

    private getTFA(): void {
        this.isLoading = true;
        this._authService.getTFASetting().subscribe({
            next: (value) => {
                this.TFAImage = value.dataURL;
                this.isLoading = false;
            },
            error: (err) => {
                this.dialogRef.close();
                this.notificationService.showNotification(
                    'error',
                    this.translationService.instant(
                        err.error?.error || 'SOMETHING_WENT_WRONG'
                    )
                );
            }
        });
    }

    enableTFA() {
        this.isLoading = true;
        if (this.enableAuthentication?.toString().length < 6) {
            this.enableAuthentication = this.enableAuthentication
                .toString()
                .padStart(6, '0');
        } else {
            this.enableAuthentication = this.enableAuthentication.toString();
        }
        this._authService
            .verifyTFA({
                code: this.enableAuthentication
            })
            .subscribe({
                next: (res) => {
                    this.isLoading = false;
                    this.enableAuthentication = null;
                    this.isEnable = !this.isEnable;
                    this.checkEnable = !this.isEnable;
                    if (!this.isEnable) {
                        this.getTFA();
                    }
                    this.notificationService.showNotification(
                        'success',
                        this.translationService.instant(res.message)
                    );
                    this.dialogRef.close();
                },
                error: (err) => {
                    this.isLoading = false;
                    this.enableAuthentication = null;
                    this.notificationService.showNotification(
                        'error',
                        this.translationService.instant(
                            err.error?.error || 'SOMETHING_WENT_WRONG'
                        )
                    );
                }
            });
    }

    deleteProfileModal(deleteProfileTemp: TemplateRef<any>) {
        this.dialogRef = this.dialog.open(deleteProfileTemp, {
            width: '30vw'
        });
    }

    public deleteProfile(): void {
        this._authService
            .deleteProfile(this.deleteProfileForm.value)
            .subscribe({
                next: (response) => {
                    this.dialogRef.close();
                    this.deleteMessage = '';
                    localStorage.clear();
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i];
                        const eqPos = cookie.indexOf('=');
                        const name =
                            eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                        document.cookie =
                            name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    }
                    this._router.navigate(['/login']);
                    this.notificationService.showNotification(
                        'success',
                        this.translationService.instant(response.message)
                    );
                },
                error: (err) => {
                    this.dialogRef.close();
                    this.deleteMessage = '';
                    this.enableAuthentication = null;
                    this.notificationService.showNotification(
                        'error',
                        this.translationService.instant(
                            err.error?.error || 'SOMETHING_WENT_WRONG'
                        )
                    );
                }
            });
    }

    selectProfile(index: number): void {
        this.profileTabs.forEach((profileActiveTabs) => {
            profileActiveTabs.isActive = false;
        });
        this.profileTabs[index].isActive = true;
        this.activeTabs = this.profileTabs[index].name;
    }

    changeTFASetting(TFA_profile: TemplateRef<any>): void {
        if (!this.isEnable) {
            this.getTFA();
        }
        this.dialogRef = this.dialog.open(TFA_profile, {
            width: '30vw'
        });
        this.dialogRef.afterClosed().subscribe({
            next: () => {
                if (this.isEnable !== this.checkEnable) {
                    this.checkEnable = !this.checkEnable;
                }
            }
        });
    }
}
