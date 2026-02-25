import { Injectable } from '@angular/core';
import { Classificacao, Operation } from '../../../../../server/constants/data.enum';
import { MenuOperation } from '../models/operation.models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private _operationMenu: MenuOperation[] = [
    {
      icon: 'send_money',
      label: 'PIX',
      operation: Operation.PIX,
      classificacao: Classificacao.DESPESA
    },
    {
      icon: 'savings',
      label: 'DEPÓSITO',
      operation: Operation.DEPOSITO,
      classificacao: Classificacao.RECEITA
    },
    {
      icon: 'payments',
      label: 'SAQUE',
      operation: Operation.SAQUE,
      classificacao: Classificacao.DESPESA
    },
    {
      icon: 'money',
      label: 'DÉBITO',
      operation: Operation.DEBITO,
      classificacao: Classificacao.DESPESA
    },
    {
      icon: 'request_quote',
      label: 'PAGAMENTO',
      operation: Operation.PAGAMENTO,
      classificacao: Classificacao.DESPESA
    }
  ];
  private currentOp$ = new BehaviorSubject<MenuOperation>(this.operationMenu[0]);
  
  get operationMenu() {
    return this._operationMenu;
  }

  get currentOp(): Observable<MenuOperation> {
    return this.currentOp$;
  }

  set currentOp(currentOp: MenuOperation) {
    this.currentOp$.next(currentOp);
  }
}
