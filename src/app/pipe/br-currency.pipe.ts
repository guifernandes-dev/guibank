import { Pipe, PipeTransform, Signal } from '@angular/core';
import { Language } from '../core/models/services.model';

@Pipe({
  name: 'brCurrency',
  pure: false,
})
export class BrCurrencyPipe implements PipeTransform {
  transform(value: number, lang: Signal<Language>, isExpense?: boolean): string {
    let mult = 1
    const {culture, currency} = lang();
    
    if (isExpense)  mult = -1;
    return (value * mult).toLocaleString(culture, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

}
