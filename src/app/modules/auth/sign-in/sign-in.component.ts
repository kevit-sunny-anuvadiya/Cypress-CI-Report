import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    NgForm,
    Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../../@fuse/services/notification/notification.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    signInForm: UntypedFormGroup;
    showAlert = false;
    isTFAEnable = false;
    isUpdating = false;
    enableAuthentication: number | string;
    token: string;
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private route: ActivatedRoute,
        private readonly translationService: TranslateService,
        private readonly notificationService: NotificationService
    ) {
        localStorage.clear();
        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        const email = this.route.snapshot.paramMap.get('email');
        // Create the form
        this.signInForm = this._formBuilder.group({
            email: [
                email ? email : '',
                [Validators.required, Validators.email]
            ],
            password: ['', Validators.compose([Validators.required])],
            rememberMe: ['']
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value).subscribe({
            next: (response) => {
                if (response?.isTFAEnable) {
                    this.isTFAEnable = response.isTFAEnable;
                    this.token = response.accessToken;
                    return;
                }
                this.setUserInfo(response);
            },
            error: (err) => {
                // Re-enable the form
                this.signInForm.enable();

                // Reset the form
                this.signInNgForm.resetForm();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: 'Wrong email or password'
                };

                // Show the alert
                this.showAlert = true;

                this.notificationService.showNotification(
                    'error',
                    this.translationService.instant(
                        err.error?.error || 'SOMETHING_WENT_WRONG'
                    )
                );
            }
        });
    }
    private setUserInfo(response): void {
        localStorage.setItem('user', JSON.stringify(response));
        this.translationService.setDefaultLang(response.language);
        this._router.navigate(['/home']);
    }

    verifyTFA() {
        if (this.enableAuthentication?.toString().length < 6) {
            this.enableAuthentication = this.enableAuthentication
                .toString()
                .padStart(6, '0');
        }
        this._authService
            .checkTFACode(this.enableAuthentication, this.token)
            .subscribe({
                next: (response) => {
                    this.setUserInfo(response);
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
}
