import { Component, OnDestroy, OnInit } from '@angular/core';
import { customerDetails, FirmDataInfo } from './request.type';
import { TaskService } from '../../../../@fuse/services/pti/task.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../@fuse/services/notification/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../../core/user/user.types';
import { UserService } from '../../../core/user/user.service';

@Component({
    selector: 'app-request',
    templateUrl: './request.component.html',
    styleUrls: ['./request.component.scss']
})
export class RequestComponent implements OnInit, OnDestroy {
    progressIndex = 0;
    public isGetLink = false;
    public user;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public sentData = [];
    public completeData = [];
    public pagination = {
        page: 1,
        limit: 10
    };
    public taskInformation: customerDetails;
    public tabView: 'SENT' | 'COMPLETED' = 'SENT';
    public firmCardInfo: Array<FirmDataInfo> = [
        {
            class: 'SENT',
            name: 'OUTSTANDING_REQUESTS',
            requestCount: 0
        },
        {
            class: 'COMPLETED',
            name: 'COMPLETED_REQUESTS',
            requestCount: 0
        }
    ];
    isLoading = true;
    constructor(
        private readonly router: Router,
        private readonly _taskService: TaskService,
        private readonly notificationService: NotificationService,
        private readonly translationService: TranslateService,
        private readonly _userService: UserService
    ) {}

    ngOnInit(): void {
        this.getTaskInfo();
        this._userService.user$.subscribe((user: User) => {
            this.user = user;
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
    public activeTabs(type: 'SENT' | 'COMPLETED'): void {
        this.tabView = type;
    }
    private getTaskInfo(): void {
        this._taskService.getTaskInfo().subscribe({
            next: (taskInfo) => {
                this.taskInformation = taskInfo;
                this.getStatusInfo();
                this.getStatusInfo('COMPLETED');
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

    private getStatusInfo(complete?, isPagination = false): void {
        this._taskService
            .getStatus(
                complete ? complete.toLowerCase() : this.tabView.toLowerCase(),
                this.pagination.limit,
                this.pagination.page
            )
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    if (
                        complete === 'COMPLETED' ||
                        this.tabView === 'COMPLETED'
                    ) {
                        if (isPagination) {
                            this.completeData = [
                                ...this.completeData,
                                ...response.docs
                            ];
                        } else {
                            this.completeData = response.docs;
                        }
                        this.firmCardInfo[1].requestCount =
                            this.completeData.length;
                        return;
                    }
                    if (isPagination) {
                        this.sentData = [...this.sentData, ...response.docs];
                    } else {
                        this.sentData = response.docs;
                    }
                    this.firmCardInfo[0].requestCount = this.sentData.length;
                    this.isLoading = false;
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

    onScrollGetTask(): void {
        this.pagination.page++;
        this.getStatusInfo('', true);
    }

    taskLink(taskId: string, index: number) {
        this.progressIndex = index;
        this.isGetLink = true;
        this._taskService
            .getTaskLink(taskId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (taskLink) => {
                    this.router.navigate([]).then(() => {
                        window.open(taskLink.token, '_blank');
                    });
                    this.isGetLink = false;
                },
                error: (err) => {
                    this.isGetLink = false;
                    this.notificationService.showNotification(
                        'error',
                        this.translationService.instant(
                            err.error?.error || 'SOMETHING_WENT_WRONG'
                        )
                    );
                }
            });
    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
