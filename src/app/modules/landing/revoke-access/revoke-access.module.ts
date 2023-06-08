import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { RevokeAccessComponent } from './revoke-access.component';
import { revokeAccessRoutes } from './revoke-access.routing';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [RevokeAccessComponent],
    imports: [
        RouterModule.forChild(revokeAccessRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        TranslateModule
    ]
})
export class RevokeAccessModule {}
