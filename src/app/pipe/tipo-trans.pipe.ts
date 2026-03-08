import { inject, Pipe, PipeTransform } from '@angular/core';
import { Transaction } from '../../server/models/db.model';
import { Operation } from '../../server/constants/db.enum';
import { MenuOperation } from '../main-panel/pages/transfer/models/operation.models';
import { LoginService } from '../core/login.services/login.service';
import { UtilService } from '../core/util.services/util.service';

@Pipe({
  name: 'tipoTrans'
})
export class TipoTransPipe implements PipeTransform {
  private readonly utilService = inject(UtilService);
  private readonly loginService = inject(LoginService);

  transform(trans: Transaction): MenuOperation {
    const item = this.utilService.transTypes.find(item => trans.tipo === item.operation)!;
    const accountLogged = this.loginService.user()?.conta;
    if(trans.tipo === Operation.PIX) {
      if(trans.destino?.conta === accountLogged) return {...item, label: `RECEBIMENTO POR ${item.label}`};
      return {...item, label: `PAGAMENTO POR ${item.label}`};
    };
    return item;
  }

}
