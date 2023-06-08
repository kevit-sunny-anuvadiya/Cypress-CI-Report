import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { AccountingComponent } from './accounting.component';
import { LayoutModule } from '../../../layout/layout.module';
import {TranslateModule} from "@ngx-translate/core";

const exampleRoutes: Route[] = [
    {
        path: '',
        component: AccountingComponent
    }
];

@NgModule({
    declarations: [AccountingComponent],
    exports: [AccountingComponent],
    imports: [RouterModule.forChild(exampleRoutes), LayoutModule, TranslateModule]
})
export class AccountingModule {}
