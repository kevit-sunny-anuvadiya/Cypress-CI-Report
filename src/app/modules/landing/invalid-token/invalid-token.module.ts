import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { InvalidTokenComponent } from './invalid-token.component';
import { invalidTokenRoutes } from './invalid-token.routing';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [InvalidTokenComponent],
    imports: [
        RouterModule.forChild(invalidTokenRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        TranslateModule
    ]
})
export class InvalidTokenModule {}
