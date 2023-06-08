import {
    Component,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { UntypedFormBuilder, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseValidators } from '../../../../@fuse/validators';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../../@fuse/services/notification/notification.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { CountdownEvent } from 'ngx-countdown';
import { isLanguageAvailable } from '../../../../@fuse/utils/language-helper';

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AuthSignUpComponent {
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;
    isVerify = false;
    openVerificationModal = false;
    isEmailAvailable = false;
    sendVerification: number;

    reSendOTP = false;
    dialogRef: MatDialogRef<any>;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    signUpForm = this._formBuilder.group(
        {
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: [
                '',
                [
                    Validators.required,
                    Validators.pattern(
                        `^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-._;"():'=]).{8,}$`
                    )
                ]
            ],
            confirmPassword: [
                '',
                [
                    Validators.required,
                    Validators.pattern(
                        `^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-._;"():'=]).{8,}$`
                    )
                ]
            ],
            agreements: ['', Validators.requiredTrue]
        },
        {
            validators: FuseValidators.mustMatch('password', 'confirmPassword')
        }
    );
    showAlert = false;
    userDetails;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private readonly translationService: TranslateService,
        private readonly notificationService: NotificationService,
        private recaptchaV3Service: ReCaptchaV3Service,
        private dialog: MatDialog
    ) {
        localStorage.clear();
        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        const token = this._router.url.split('?token=')[1];
        if (!token) {
            this._router.navigate(['/sign-in']);
            return;
        }
        this.getUserDetails(token);
    }

    private getUserDetails(token: string): void {
        this._authService.getUserDetailsFromToken(token).subscribe({
            next: (userDetails) => {
                this.userDetails = userDetails;
                this.translationService.setDefaultLang(
                    userDetails?.language ||
                        isLanguageAvailable(navigator.language)
                );
                if (userDetails.status === 'onboarding_completed') {
                    this._router.navigate([
                        '/sign-in',
                        { email: userDetails.email }
                    ]);
                }
                this.initSignUpForm(userDetails);
            },
            error: (err) => {
                if (err.error.error === 'TOKEN_EXPIRED') {
                    this._router.navigate(['token-invalid']);
                }
                this.initSignUpForm();
                this.notificationService.showNotification(
                    'error',
                    this.translationService.instant(
                        err.error?.error || 'SOMETHING_WENT_WRONG'
                    )
                );
            }
        });
    }
    private initSignUpForm(userDetails?): any {
        this.signUpForm = this._formBuilder.group(
            {
                firstName: [
                    userDetails ? userDetails.firstName : '',
                    Validators.required
                ],
                lastName: [
                    userDetails ? userDetails.lastName : '',
                    Validators.required
                ],
                email: [
                    userDetails ? userDetails?.emailSuggestion : '',
                    [Validators.required, Validators.email]
                ],
                password: [
                    '',
                    [
                        Validators.required,
                        Validators.pattern(
                            `^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-._;"():'=]).{8,}$`
                        )
                    ]
                ],
                confirmPassword: [
                    '',
                    [
                        Validators.required,
                        Validators.pattern(
                            `^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-._;"():'=]).{8,}$`
                        )
                    ]
                ],
                agreements: ['', Validators.requiredTrue]
            },
            {
                validators: FuseValidators.mustMatch(
                    'password',
                    'confirmPassword'
                )
            }
        );
        if (this.signUpForm.value.email) {
            this.checkEmail();
        }
        this.signUpForm.get('email').valueChanges.subscribe({
            next: () => {
                this.isEmailAvailable = false;
            }
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void {
        this.recaptchaV3Service.execute('importantAction').subscribe({
            next: (token) => {
                if (token) {
                    if (this.signUpForm.invalid) {
                        return;
                    }
                    // Hide the alert
                    this.showAlert = false;
                    const passwordObj = {
                        email: this.signUpForm.value.email,
                        password: this.signUpForm.value.password,
                        confirmPassword: this.signUpForm.value.confirmPassword,
                        otp: this.sendVerification
                    };
                    this._authService
                        .signUp(
                            passwordObj,
                            this._router.url.split('?token=')[1]
                        )
                        .subscribe({
                            next: () => {
                                document
                                    .getElementsByTagName('body')[0]
                                    .classList.add('hide_Captcha');
                                this._router.navigateByUrl('/home');
                            },
                            error: (err) => {
                                if (
                                    err.error.error === 'OTP_EXPIRED' ||
                                    err.error.error === 'INVALID_OTP'
                                ) {
                                    this.sendVerification = null;
                                    this.reSendOTP = true;
                                }

                                // Set the alert
                                this.alert = {
                                    type: 'error',
                                    message:
                                        'Something went wrong, please try again.'
                                };

                                // Show the alert
                                this.showAlert = true;

                                this.notificationService.showNotification(
                                    'error',
                                    this.translationService.instant(
                                        err.error?.error ||
                                            'SOMETHING_WENT_WRONG'
                                    )
                                );
                            }
                        });
                }
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

    public checkEmail(isOpenModal = false): void {
        this.sendVerification = null;
        this._authService
            .checkMail(
                {
                    email: this.signUpForm.value.email
                },
                this._router.url.split('?token=')[1]
            )
            .subscribe({
                next: (response) => {
                    this.isEmailAvailable = response.isAvailable;
                    if (response.isAvailable && isOpenModal) {
                        this.sendOTP();
                        return;
                    }
                    if (!response.isAvailable) {
                        this.notificationService.showNotification(
                            'error',
                            this.translationService.instant(
                                'THIS_EMAIL_IS_ALREADY_TAKEN_PLEASE_CHANGE_EMAIL_AND_TRY_AGAIN'
                            )
                        );
                    }
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

    sendOTP(): void {
        this._authService
            .sendCode(
                {
                    email: this.signUpForm.value.email
                },
                this._router.url.split('?token=')[1]
            )
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
    checkCountdown(event: CountdownEvent) {
        if (event.action === 'done') {
            this.reSendOTP = true;
        }
    }
}
