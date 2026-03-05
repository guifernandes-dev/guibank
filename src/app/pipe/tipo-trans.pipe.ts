import { inject, Pipe, PipeTransform } from '@angular/core';
import { Transaction } from '../../server/models/db.model';
import { Operation } from '../../server/constants/db.enum';
import { OperationService } from '../main-panel/pages/transfer/services/operation.service';
import { MenuOperation } from '../main-panel/pages/transfer/models/operation.models';
import { LoginService } from '../core/login.services/login.service';

@Pipe({
  name: 'tipoTrans'
})
export class TipoTransPipe implements PipeTransform {
  private readonly operationService = inject(OperationService);
  private readonly loginService = inject(LoginService);

  transform(trans: Transaction): MenuOperation {
    const item = this.operationService.operationMenu.find(item => trans.tipo === item.operation)!;
    const accountLogged = this.loginService.user()?.conta;
    if(trans.tipo === Operation.PIX) {
      if(trans.destino?.conta === accountLogged) return {...item, label: `RECEBIMENTO POR ${item.label}`};
      return {...item, label: `PAGAMENTO POR ${item.label}`};
    };
    return item;
  }

}
