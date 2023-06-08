import {Directive, ElementRef, HostListener, Inject, Input, QueryList, Renderer2, SimpleChanges} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({ selector: '[skeleton]' })
export class SkeletonDirective {
    @Input() skeleton;
    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
        @Inject(DOCUMENT) private document: Document
    ) {}

    @HostListener('change') ngOnChanges() {
        this.applyLoader();
    }

    private applyLoader() {
        const child = this.document.createElement('div');
        if(this.skeleton){
            this.el.nativeElement.classList.add('skeleton-loader-parent');
            child.classList.add('skeleton-loader');
            this.renderer.appendChild(this.el.nativeElement, child);
        }else{
            this.el.nativeElement.classList.remove('skeleton-loader-parent');
            child.classList.remove('skeleton-loader');
            var elements = this.document.getElementsByClassName('skeleton-loader');
            while(elements.length > 0){
                elements[0].parentNode.removeChild(elements[0]);
            }
        }
    }
}
