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
    const accountLogged = this.loginService.user()?.id;
    if(trans.tipo === Operation.PIX) {
      return {
        ...item,
        label: `MENU_OP.TYPE_TRANS.${trans.destino?.id === accountLogged
          ? 'CREDIT'
          : 'PAYMENT'}`
      };
    };
    return item;
  }

}
