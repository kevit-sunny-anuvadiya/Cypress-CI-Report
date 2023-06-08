import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {
    private _authenticated = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private readonly router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        document.cookie = `accessToken=${token}`;
    }

    get accessToken(): string {
        return document.cookie.split('accessToken=')[1];
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post(
            `${environment.apiUrl}/user/forget-password-token`,
            { email: email }
        );
    }

    /**
     * Reset password
     *
     * @param passwordDetails
     * @param token
     */
    resetPassword(
        passwordDetails: { password: string; confirmPassword: string },
        token: string
    ): Observable<any> {
        return this._httpClient.post(
            `${environment.apiUrl}/user/forget-reset-password`,
            passwordDetails,
            {
                headers: {
                    authorization: token
                }
            }
        );
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient
            .post(`${environment.apiUrl}/user/signIn`, credentials)
            .pipe(
                switchMap((response: any) => {
                    if (!response.isTFAEnable) {
                        this.accessToken = response.accessToken;
                        this._userService.user = response;
                    }
                    // Set the authenticated flag to true
                    this._authenticated = true;
                    return of(response);
                    // Return a new observable with the response
                })
            );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient
            .post('api/auth/sign-in-with-token', {
                accessToken: this.accessToken
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    // Replace the access token with the new one if it's available on
                    // the response object.
                    //
                    // This is an added optional step for better security. Once you sign
                    // in using the token, you should generate a new one on the server
                    // side and attach it to the response object. Then the following
                    // piece of code can replace the token with the refreshed one.
                    if (response.accessToken) {
                        this.accessToken = response.accessToken;
                    }

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response;

                    // Return true
                    return of(true);
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param passwordDetails
     * @param token
     */
    signUp(
        passwordDetails: { password: string; confirmPassword: string },
        token: string
    ): Observable<any> {
        return this._httpClient.patch(
            `${environment.apiUrl}/user/password`,
            passwordDetails,
            {
                headers: {
                    authorization: token
                }
            }
        );
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this.accessToken) {
            return of(true);
        }
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }

    getUserDetailsFromToken(token: string): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/user/status`, {
            headers: {
                authorization: token
            }
        });
    }

    sendCode(email: { email: string }, token?: string): Observable<any> {
        if (!token) {
            return this._httpClient.post(
                `${environment.apiUrl}/user/send-otp`,
                email
            );
        }
        return this._httpClient.post(
            `${environment.apiUrl}/user/send-otp`,
            email,
            {
                headers: {
                    authorization: token
                }
            }
        );
    }

    checkMail(email: { email: string }, token?: string): Observable<any> {
        if (!token) {
            return this._httpClient.post(
                `${environment.apiUrl}/user/check-email`,
                email
            );
        }
        return this._httpClient.post(
            `${environment.apiUrl}/user/check-email`,
            email,
            {
                headers: {
                    authorization: token
                }
            }
        );
    }
    getTFASetting(): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/tfa`);
    }
    verifyTFA(TFAObj: { code: number | string }): Observable<any> {
        return this._httpClient.patch(
            `${environment.apiUrl}/tfa/verify`,
            TFAObj
        );
    }

    checkTFACode(code: number | string, token: string): Observable<any> {
        return this._httpClient
            .post(
                `${environment.apiUrl}/tfa/login`,
                { code: code },
                {
                    headers: {
                        authorization: token
                    }
                }
            )
            .pipe(
                switchMap((response: any) => {
                    this.accessToken = response.accessToken;
                    this._userService.user = response;
                    return of(response);
                })
            );
    }

    deleteProfile(password): Observable<any> {
        return this._httpClient.put(`${environment.apiUrl}/user`, password);
    }
}
