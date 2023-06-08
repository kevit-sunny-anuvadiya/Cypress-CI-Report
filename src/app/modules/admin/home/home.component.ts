import { Component, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { TaskService } from '../../../../@fuse/services/pti/task.service';
import { takeUntil } from 'rxjs';
import { User } from '../../../core/user/user.types';
import { UserService } from '../../../core/user/user.service';

@Component({
    selector: 'example',
    templateUrl: './home.component.html',
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
    public user;
    @Output() isHomeLoader = true;
    constructor(
        private readonly _taskService: TaskService,
        private readonly _userService: UserService
    ) {}

    ngOnInit(): void {
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
}
