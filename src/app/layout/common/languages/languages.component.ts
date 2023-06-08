import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { take } from 'rxjs';
import { AvailableLangs, TranslocoService } from '@ngneat/transloco';
import {
    FuseNavigationService,
    FuseVerticalNavigationComponent
} from '@fuse/components/navigation';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'languages',
    templateUrl: './languages.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'languages'
})
export class LanguagesComponent implements OnInit {
    isLoading = true;
    activeLang = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')).language
        : 'en';
    availableLangs: AvailableLangs = [
        {
            id: 'en',
            label: 'English'
        },
        {
            id: 'nl',
            label: 'Dutch'
        },
        {
            id: 'de',
            label: 'German'
        },
        {
            id: 'fr',
            label: 'French'
        }
    ];
    flagCodes = {
        en: 'us',
        de: 'de',
        nl: 'nl',
        fr: 'fr'
    };

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseNavigationService: FuseNavigationService,
        private _translocoService: TranslocoService,
        private translateService: TranslateService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit() {
        this.translateService.onLangChange.subscribe({
            next: (language) => {
                setTimeout(() => {
                    this.activeLang = language.lang;
                    this._changeDetectorRef.detectChanges(), 1000;
                });
                this.isLoading = false;
            }
        });
        if (this.translateService.currentLang) {
            this.activeLang = this.translateService.currentLang;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set the active lang
     *
     * @param lang
     */
    setActiveLang(lang: string): void {
        // Set the active lang
        this.translateService.use(lang);
        this.activeLang = lang;
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
