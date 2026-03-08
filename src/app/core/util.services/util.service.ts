import { Injectable } from '@angular/core';
import { MenuOperation } from '../../main-panel/pages/transfer/models/operation.models';
import { Operation } from '../../../server/constants/db.enum';
import { Installment, Loan } from '../../../server/models/db.model';
@Injectable({
  providedIn: 'root'
})
export class UtilService {
  readonly duration = 5000;

  transTypes: MenuOperation[] = [
    {
      icon: 'send_money',
      label: 'PIX',
      operation: Operation.PIX
    },
    {
      icon: 'savings',
      label: 'DEPÓSITO',
      operation: Operation.DEPOSITO
    },
    {
      icon: 'payments',
      label: 'SAQUE',
      operation: Operation.SAQUE
    },
    {
      icon: 'money',
      label: 'DÉBITO',
      operation: Operation.DEBITO
    },
    {
      icon: 'request_quote',
      label: 'PAGAMENTO',
      operation: Operation.PAGAMENTO
    },
    {
      icon: 'price_check',
      label: 'CRÉDITO DE EMPRÉSTIMO',
      operation: Operation.CREDITO
    }
  ]

  formataValorInput (event: Event): string {
    const input = event.target as HTMLInputElement;
    const text = input.value;
    // 1. Retira qualquer coisa que não for número
    let valor = text.replace(/[^0-9]/g, '');
    
    // 2. verifica se estou apagando
    if (input.value.length === valor.length+1) {
      //2.1. adiciona o zero à esquerda
      valor = '0' + valor
    // 3. verifica se há zero à esquerda e se o botão apertado pelo usuário é um número
    } else if(valor[0] === '0' && input.value.length-2 !== valor.length) {
      // 3.1. remove o primeiro zero à esquerda
      valor = valor.substring(1);
    }
    // 4. Adiciona o "." após os dois últimos dígitos
    valor = valor.slice(0, -2) + '.' + valor.slice(-2);
    
    // 5. transforma a string em number
    let numero = parseFloat(valor);
    if (isNaN(numero)) {
      numero = 0;
    }

    // 6. Formata no padrão brasileiro: #.###,##
    return this.formataValor(numero);
  }

  formataValorNumero(valor: string): number {
    return parseFloat(valor.replaceAll('.','').replaceAll(',','.'))
  }

  formataValor (valor: number): string {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  filtraData = (date: Date | null): boolean => {
    const day = (date || new Date()).getDay();
    return day !== 0 && day !== 6;
  };

  converteTax(iaa: number, fator: number, nt: number = 12, nq: number = 1): number {
    return (((1+iaa)**(nq/nt))-1)*fator;
  }

  round(num: number, digits: number) {
    const mult = Math.pow(10,digits);
    return Math.round(num * mult)/mult
  }

  cursorend(event: Event, value?: string) {
    const input = event.target as HTMLInputElement;
    let valor;
    if (!value) {
      valor = input.value;
    } else {
      valor = value;
    }
    input.setSelectionRange(valor.length,valor.length);
  }

  parcelaHoje({parcela, item, amortizacao, vencimento}: Installment, loan: Loan): number {
    const umDia = 1000 * 60 * 60 * 24;
    const hoje= new Date();
    const hojeData = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const vencData = new Date(vencimento.getFullYear(), vencimento.getMonth(), vencimento.getDate());
    let diffMs = hojeData.getTime()- vencData.getTime();
    const diasAtraso = Math.round(diffMs / umDia);    
    const taxadia = this.converteTax(loan.taxa,1,30,1);

    if(diasAtraso>0) {
      const jurosAoDia = loan.taxa / 30; // mercado usa 30 dias
      const valorMulta = parcela * 0.02;
      const valorJuros = parcela * jurosAoDia * (diasAtraso);
      return parcela + valorMulta + valorJuros;
    }
    if(diasAtraso<-30) {
      return amortizacao;
    }
    const saldo = item === 1 ? loan.valor : loan.parcelas[item-2].amortizacao;
    const anterior = item === 1 ? loan.data : loan.parcelas[item-2].vencimento;
    
    const mesAnterior = new Date(anterior.getFullYear(), anterior.getMonth(), anterior.getDate());
    diffMs = hojeData.getTime()- mesAnterior.getTime();
    const periodo = Math.round(diffMs / umDia);
    const vf = saldo * Math.pow(1 + taxadia, periodo);
    const j = vf - saldo;
    return amortizacao + j;
  }
}
