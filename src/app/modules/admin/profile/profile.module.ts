import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { SkeletonModule } from '../../../../@fuse/directives/skeleton-loaders/skeleton.module';
import { MatDialogModule } from '@angular/material/dialog';
import { CountdownComponent } from 'ngx-countdown';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

const exampleRoutes: Route[] = [
    {
        path: '',
        component: ProfileComponent
    }
];

@NgModule({
    declarations: [ProfileComponent],
    imports: [
        RouterModule.forChild(exampleRoutes),
        MatInputModule,
        ReactiveFormsModule,
        MatIconModule,
        NgIf,
        TranslateModule,
        MatSelectModule,
        MatButtonModule,
        SkeletonModule,
        FormsModule,
        MatDialogModule,
        CountdownComponent,
        MatDividerModule,
        MatSidenavModule,
        NgClass,
        NgForOf,
        MatSlideToggleModule
    ]
})
export class ProfileModule {}
