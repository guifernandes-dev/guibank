import { Pipe, PipeTransform } from '@angular/core';
import { Installment, Transaction } from '../../server/models/db.model';

@Pipe({
  name: 'alertClass'
})
export class AlertClassPipe implements PipeTransform {

  transform(trans: Transaction | Installment, prefix: string = 'alert'): string {
    const hoje = new Date();
    hoje.setHours(23,59,59,999);
    
    const venc = trans.vencimento;
    venc?.setHours(23,59,59,999);
    
    if(!venc) {
      return '';
    }
    const {pago} = trans;
    
    if(pago) return `${prefix}-secondary`;
    if(hoje > venc) return `${prefix}-danger`;
    if(hoje < venc) return `${prefix}-light`;
    return `${prefix}-warning`;
  }

}
