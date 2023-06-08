import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { HomeComponent } from 'app/modules/admin/home/home.component';
import { MatIconModule } from '@angular/material/icon';
import { LayoutModule } from '../../../layout/layout.module';
import { TranslateModule } from '@ngx-translate/core';
import {NgIf} from "@angular/common";
import {SkeletonModule} from "../../../../@fuse/directives/skeleton-loaders/skeleton.module";

const exampleRoutes: Route[] = [
    {
        path: '',
        component: HomeComponent
    }
];

@NgModule({
    declarations: [HomeComponent],
  imports: [
    RouterModule.forChild(exampleRoutes),
    MatIconModule,
    LayoutModule,
    TranslateModule,
    NgIf,
    SkeletonModule,
  ]
})
export class HomeModule {}
