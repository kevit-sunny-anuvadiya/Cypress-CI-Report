import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'date'
})
export class NgxDatePipe implements PipeTransform {
    constructor(private translateService: TranslateService) {}

    public transform(value: any, pattern: string = 'mediumDate'): any {
        const datePipe = new DatePipe(this.translateService.currentLang);
        return datePipe.transform(value, pattern);
    }
}
