import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
@Pipe({
    name: 'age'
})
export class AgePipe implements PipeTransform {

    transform(value: Date): string {
        let today = moment();
        let birthdate = moment(value);
        let years = today.diff(birthdate, 'years');
        console.log("years", value);
        let html:string = years + " yr ";

        html += today.subtract(years, 'years').diff(birthdate, 'months') + " month";

        return html;
    }

}