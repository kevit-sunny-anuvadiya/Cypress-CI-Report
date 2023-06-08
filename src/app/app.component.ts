import { Component, OnDestroy, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { isLanguageAvailable } from '../@fuse/utils/language-helper';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    locale: string;
    offlineEvent: Observable<Event>;
    onlineEvent: Observable<Event>;
    subscriptions: Subscription[] = [];
    constructor(private translateService: TranslateService) {
        if (localStorage.getItem('user')) {
            this.translateService.setDefaultLang(
                JSON.parse(localStorage.getItem('user')).language
            );
            this.translateService.use(
                JSON.parse(localStorage.getItem('user')).language
            );
        } else {
            this.translateService.setDefaultLang(
                isLanguageAvailable(navigator.language)
            );
            this.translateService.use(isLanguageAvailable(navigator.language));
        }
    }

    ngOnInit(): void {
        this.handleAppConnectivityChanges();
    }

    private handleAppConnectivityChanges(): void {
        this.onlineEvent = fromEvent(window, 'online');
        this.offlineEvent = fromEvent(window, 'offline');
        this.subscriptions.push(
            this.onlineEvent.subscribe((e) => {
                document
                    .getElementsByTagName('html')[0]
                    .classList.remove('disable');
                location.reload();
            })
        );

        this.subscriptions.push(
            this.offlineEvent.subscribe((e) => {
                document
                    .getElementsByTagName('html')[0]
                    .classList.add('disable');
            })
        );
    }

    private updateLanguage(): void {
        this.locale = this.translateService.currentLang;
        // don't forget to unsubscribe!
        this.translateService.onLangChange.subscribe(
            (langChangeEvent: LangChangeEvent) => {
                this.locale = langChangeEvent.lang;
            }
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) =>
            subscription.unsubscribe()
        );
    }
}
