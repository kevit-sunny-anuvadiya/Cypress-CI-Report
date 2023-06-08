import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { UserComponent } from 'app/layout/common/user/user.component';
import { SharedModule } from 'app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import {SkeletonModule} from "../../../../@fuse/directives/skeleton-loaders/skeleton.module";

@NgModule({
    declarations: [UserComponent],
    imports: [
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        SharedModule,
        TranslateModule,
        RouterLink,
        SkeletonModule
    ],
    exports: [UserComponent]
})
export class UserModule {}
