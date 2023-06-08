import { NgModule } from '@angular/core';
import { SkeletonDirective } from "./skeleton.directive";

@NgModule({
    declarations: [
        SkeletonDirective
    ],
    exports: [
        SkeletonDirective
    ]
})
export class SkeletonModule
{
}
