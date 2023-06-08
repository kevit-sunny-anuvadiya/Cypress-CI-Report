import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    NgForm,
    Validators
} from '@angular/forms';
import { finalize } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseValidators } from '@fuse/validators';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../@fuse/services/notification/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'auth-reset-password',
    templateUrl: './reset-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AuthResetPasswordComponent implements OnInit {
    @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    resetPasswordForm: UntypedFormGroup;
    showAlert = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private readonly _router: Router,
        private readonly notificationService: NotificationService,
        private readonly translationService: TranslateService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.resetPasswordForm = this._formBuilder.group(
            {
                password: [
                    '',
                    [
                        Validators.required,
                        Validators.pattern(
                            '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'
                        )
                    ]
                ],
                passwordConfirm: ['', Validators.required]
            },
            {
                validators: FuseValidators.mustMatch(
                    'password',
                    'passwordConfirm'
                )
            }
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Reset password
     */
    resetPassword(): void {
        // Return if the form is invalid
        if (this.resetPasswordForm.invalid) {
            return;
        }

        // Disable the form
        this.resetPasswordForm.disable();

        // Hide the alert
        this.showAlert = false;
        const passwordObj = {
            password: this.resetPasswordForm.get('password').value,
            confirmPassword: this.resetPasswordForm.get('passwordConfirm').value
        };
        // Send the request to the server
        this._authService
            .resetPassword(passwordObj, this._router.url.split('?token=')[1])
            .pipe(
                finalize(() => {
                    // Re-enable the form
                    this.resetPasswordForm.enable();

                    // Reset the form
                    this.resetPasswordNgForm.resetForm();

                    // Show the alert
                    this.showAlert = true;
                })
            )
            .subscribe({
                next: () => {
                    // Set the alert
                    this.alert = {
                        type: 'success',
                        message: 'Your password has been reset.'
                    };
                    this._router.navigate(['/sign-in']);
                },
                error: (err) => {
                    // Set the alert
                    this.alert = {
                        type: 'error',
                        message: 'Something went wrong, please try again.'
                    };
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
