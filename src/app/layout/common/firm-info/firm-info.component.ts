import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../../../@fuse/services/pti/task.service';
import { NotificationService } from '../../../../@fuse/services/notification/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../core/user/user.service';
import { User } from '../../../core/user/user.types';

@Component({
    selector: 'app-firm-info',
    templateUrl: './firm-info.component.html',
    styleUrls: ['./firm-info.component.scss']
})
export class FirmInfoComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public selectedTask = 0;
    public taskInfo;
    isLoading = true;

    public user;
    constructor(
        public readonly router: Router,
        private readonly _taskService: TaskService,
        private readonly notificationService: NotificationService,
        private readonly translationService: TranslateService,
        private readonly _userService: UserService
    ) {}

    ngOnInit(): void {
        this.getTaskDetails();
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
                this.isLoading = false;
            });
        if (!this.user) {
            this.user = JSON.parse(localStorage.getItem('user'));
        }
    }

    getTaskDetails(): void {
        this._taskService
            .getTaskInfo()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.taskInfo = response;
                    this.isLoading = false;
                    this.setTaskDetails();
                    const user = JSON.parse(localStorage.getItem('user'));
                    user.isAssociationActive = true;
                    this._userService.user = user;
                },
                error: (err) => {
                    if (err.error.error === 'USER_ASSOCIATION_NOT_FOUND') {
                        const user = JSON.parse(localStorage.getItem('user'));
                        user.isAssociationActive = false;
                        this._userService.user = user;
                        return;
                    }
                    this.notificationService.showNotification(
                        'error',
                        this.translationService.instant(
                            err.error?.error || 'SOMETHING_WENT_WRONG'
                        )
                    );
                }
            });
    }

    setTaskDetails() {
        this._taskService.taskInfo.subscribe((response) => {
            this.taskInfo = response;
            this.isLoading = false;
        });
    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
