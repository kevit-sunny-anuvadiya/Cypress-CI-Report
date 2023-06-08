import { Injectable } from '@angular/core';
import { CanMatch, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import jwt_decode from 'jwt-decode';
import { TranslateService } from '@ngx-translate/core';
import { isLanguageAvailable } from '../../../../@fuse/utils/language-helper';

@Injectable({
    providedIn: 'root'
})
export class NoAuthGuard implements CanMatch {
    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router,
        private readonly translationService: TranslateService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Can match
     *
     * @param route
     * @param segments
     */
    canMatch(
        route: Route,
        segments: UrlSegment[]
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        if (segments[0].path === 'sign-up') {
            return true;
        } else if (segments[0].path === 'sign-in') {
            const token = window.location.href.split('?token=')[1];
            if (!token) {
                return true;
            }
            const decode: any = jwt_decode(token);
            this.translationService.setDefaultLang(
                decode?.language
                    ? decode?.language
                    : isLanguageAvailable(navigator.language)
            );
            if (
                this._authService.accessToken &&
                decode._id === JSON.parse(localStorage.getItem('user'))._id
            ) {
                this._router.navigate(['/home']);
                return false;
            }
            return true;
        }
        return this._check();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check the authenticated status
     *
     * @private
     */
    private _check(): Observable<boolean> {
        // Check the authentication status and return an observable of
        // "true" or "false" to allow or prevent the access
        return this._authService
            .check()
            .pipe(switchMap((authenticated) => of(!authenticated)));
    }
}
