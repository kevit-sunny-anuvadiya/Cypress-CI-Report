import { Injectable } from '@angular/core';
import { NotifierService } from 'angular-notifier';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    constructor(private readonly notifier: NotifierService) {}

    public showNotification(
        type: 'info' | 'success' | 'warning' | 'error',
        message: string
    ): void {
        this.notifier.notify(type, message);
    }

    public hideAllNotifications(): void {
        this.notifier.hideAll();
    }
}
