import { Injectable } from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    /**
     * Constructor
     */
    constructor(private _authService: AuthService) {}

    /**
     * Intercept
     *
     * @param req
     * @param next
     */
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        // Clone the request object
        let newReq = req.clone();

        // Request
        //
        // If the access token didn't expire, add the Authorization header.
        // We won't add the Authorization header if the access token expired.
        // This will force the server to return a "401 Unauthorized" response
        // for the protected API routes which our response interceptor will
        // catch and delete the access token from the local storage while logging
        // the user out from the app.
        if (this._authService.accessToken) {
            const setHeaders = {
                authorization: 'Bearer ' + this._authService.accessToken
            };
            newReq = req.clone({ setHeaders });
        }

        // Response
        return next.handle(newReq).pipe(
            catchError((error) => {
                // Catch "401 Unauthorized" responses
                if (
                    error instanceof HttpErrorResponse &&
                    error.status === 401
                ) {
                    // Sign out
                    this._authService.signOut();
                    localStorage.clear();
                    const cookies = document.cookie.split(';');

                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i];
                        const eqPos = cookie.indexOf('=');
                        const name =
                            eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                        document.cookie =
                            name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    }

                    // Reload the app
                    if (location.pathname !== '/sign-in') {
                        location.reload();
                    }
                }

                return throwError(error);
            })
        );
    }
}
