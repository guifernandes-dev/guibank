import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'brPercent'
})
export class BrPercentPipe implements PipeTransform {

  transform(value: number): string {
    return new Intl.NumberFormat("pt-BR",{
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

}
