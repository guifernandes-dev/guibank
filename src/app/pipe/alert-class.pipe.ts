import { Pipe, PipeTransform } from '@angular/core';
import { Transaction } from '../../server/models/db.model';

@Pipe({
  name: 'alertClass'
})
export class AlertClassPipe implements PipeTransform {
  normalizeData(data: Date): Date {
    return new Date(data.getFullYear(), data.getMonth(), data.getDay());
  }

  transform(trans: Transaction, prefix: string = 'alert'): string {
    const hoje = new Date();
    const data = trans.vencimento;
    if(!data) {
      return '';
    }
    const {pago} = trans;
    const hojeTime = this.normalizeData(hoje).getTime();
    const vencimento = this.normalizeData(data).getTime();
    if(pago) return `${prefix}-secondary`;
    if(hojeTime > vencimento) return `${prefix}-danger`;
    if(hojeTime < vencimento) return `${prefix}-light`;
    return `${prefix}-warning`;
  }

}
