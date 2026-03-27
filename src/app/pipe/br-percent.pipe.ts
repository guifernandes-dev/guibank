import { Pipe, PipeTransform, Signal } from '@angular/core';
import { Language } from '../core/models/services.model';

@Pipe({
  name: 'brPercent'
})
export class BrPercentPipe implements PipeTransform {

  transform(value: number, lang: Signal<Language>): string {
    const {culture} = lang();
    return new Intl.NumberFormat(culture,{
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

}
