import { Injectable } from '@angular/core';
import { Classificacao, TipoLanc } from '../../../../../server/constants/data.enum';
import { Operations } from '../models/operation.models';

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  private _operations: Operations[] = [
    {
      icon: '',
      label: 'PIX',
      operation: TipoLanc.PIX,
      classificacao: Classificacao.DESPESA
    },
    {
      icon: '',
      label: 'DEPÓSITO',
      operation: TipoLanc.DEPOSITO,
      classificacao: Classificacao.RECEITA
    },
    {
      icon: '',
      label: 'SAQUE',
      operation: TipoLanc.SAQUE,
      classificacao: Classificacao.DESPESA
    },
    {
      icon: '',
      label: 'PAGAMENTO',
      operation: TipoLanc.PAGAMENTO,
      classificacao: Classificacao.DESPESA
    }
  ]

  get operations() {
    return this._operations;
  }
}
