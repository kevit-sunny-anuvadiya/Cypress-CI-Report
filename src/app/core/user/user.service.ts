import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, ReplaySubject, tap } from 'rxjs';
import { HTMLInputEvent, UpdatePassword, User } from 'app/core/user/user.types';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<User> {
        return this._httpClient.get<User>(`${environment.apiUrl}/user`).pipe(
            tap((user) => {
                this._user.next(user);
            })
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any> {
        return this._httpClient
            .patch<User>(`${environment.apiUrl}/user`, user)
            .pipe(
                map((response) => {
                    this._user.next(response);
                })
            );
    }

    updatePassword(updatePassword: UpdatePassword): Observable<any> {
        return this._httpClient.post(
            `${environment.apiUrl}/user/reset-password`,
            updatePassword
        );
    }

    logOut(): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/user/logout`, {});
    }

    fileUploadEvent(file: FormData): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/storage`, file);
    }
}
