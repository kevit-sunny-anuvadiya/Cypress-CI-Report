import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { RequestComponent } from './request.component';
import {
    DatePipe,
    NgClass,
    NgForOf,
    NgIf,
    NgTemplateOutlet
} from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SkeletonModule } from '../../../../@fuse/directives/skeleton-loaders/skeleton.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxDatePipe } from '../../../../@fuse/pipes/localized-date.pipe';
const exampleRoutes: Route[] = [
    {
        path: '',
        component: RequestComponent
    }
];

@NgModule({
    declarations: [RequestComponent, NgxDatePipe],
    imports: [
        RouterModule.forChild(exampleRoutes),
        NgForOf,
        NgClass,
        NgIf,
        TranslateModule,
        MatSelectModule,
        ReactiveFormsModule,
        NgTemplateOutlet,
        DatePipe,
        InfiniteScrollModule,
        SkeletonModule,
        MatProgressSpinnerModule
    ]
})
export class RequestModule {}
