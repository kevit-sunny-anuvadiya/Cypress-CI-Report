import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    public taskInfo: ReplaySubject<any> = new ReplaySubject<any>(1);
    constructor(private _httpClient: HttpClient) {}

    getTaskInfo(): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/task`).pipe(
            tap((task) => {
                this.taskInfo.next(task);
            })
        );
    }
    getStatus(
        status: 'SENT' | 'COMPLETED',
        limit: number,
        page: number
    ): Observable<any> {
        return this._httpClient.get(
            `${environment.apiUrl}/task/${status}?page=${page}&limit=${limit}`
        );
    }

    getTaskLink(taskId: string): Observable<any> {
        return this._httpClient.get(
            `${environment.apiUrl}/task/${taskId}/link`
        );
    }
    getLastTaskLink(): Observable<any> {
        return this._httpClient.get(`${environment.apiUrl}/task/link`);
    }
}
