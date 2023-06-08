import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { BooleanInput } from '@angular/cdk/coercion';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { NotificationService } from '../../../../@fuse/services/notification/notification.service';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'user'
})
export class UserComponent implements OnInit, OnDestroy {
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() showAvatar = true;
    user: User;
    isLoading = true;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _userService: UserService,
        private readonly _notificationService: NotificationService,
        private readonly _authService: AuthService,
        private readonly translationService: TranslateService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        if (!this.user && !JSON.parse(localStorage.getItem('user'))) {
            this._userService.get().subscribe({
                next: (value) => {
                    this.user = value;
                }
            });
        }
        if (!this.user) {
            this.user = JSON.parse(localStorage.getItem('user'));
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update the user status
     *
     * @param status
     */
    updateUserStatus(status: string): void {
        // Return if user is not available
        if (!this.user) {
            return;
        }

        // Update the user
        this._userService
            .update({
                ...this.user,
                status
            })
            .subscribe();
    }

    /**
     * Sign out
     */
    signOut(): void {
        this._userService.logOut().subscribe({
            next: () => {
                this._router.navigate(['/sign-out']);
            },
            error: (err) => {
                this._notificationService.showNotification(
                    'error',
                    this.translationService.instant(
                        err.error?.error || 'SOMETHING_WENT_WRONG'
                    )
                );
            }
        });
    }
}
