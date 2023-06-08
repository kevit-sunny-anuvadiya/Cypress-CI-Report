import { Component, Input, OnInit } from '@angular/core';
import { TaskService } from '../../../../@fuse/services/pti/task.service';
import { FirmData } from './accounting-firm.types';
import { takeUntil } from 'rxjs';
import { User } from '../../../core/user/user.types';
import { UserService } from '../../../core/user/user.service';
import { NotificationService } from '../../../../@fuse/services/notification/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-accounting-firm',
    templateUrl: './accounting-firm.component.html'
})
export class AccountingFirmComponent implements OnInit {
    public isGetLink = true;
    public taskInformation;
    firm: FirmData;
    public user;
    isLoading = true;
    constructor(
        private readonly _taskService: TaskService,
        private readonly _userService: UserService,
        private readonly notificationService: NotificationService,
        private readonly translationService: TranslateService,
        private readonly router: Router
    ) {}
    ngOnInit(): void {
        this.getTaskInfo();
        this._userService.user$.pipe().subscribe((user: User) => {
            this.user = user;
        });
        if (!this.user) {
            this.user = JSON.parse(localStorage.getItem('user'));
        }
    }

    private getTaskInfo(): void {
        this._taskService.getTaskInfo().subscribe({
            next: (taskInfo) => {
                this.taskInformation = taskInfo;
                this.firm = taskInfo.firms;
                this.isLoading = false;
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

    goToLastPTI() {
        this.isGetLink = false;
        this._taskService.getLastTaskLink().subscribe({
            next: (taskLink) => {
                this.router.navigate([]).then(() => {
                    window.open(taskLink.token, '_blank');
                });
                this.isGetLink = true;
            },
            error: (err) => {
                this.isGetLink = true;
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
