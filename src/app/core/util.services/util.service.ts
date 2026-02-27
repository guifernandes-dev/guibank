import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  formatarDataHora(iso: string | Date) {
    let data: Date;
    const LOCALE = "pt-BR";
    if (typeof iso === 'string') {
      data = new Date(iso);
    } else {
      data = iso;
    }
    const dataOp = data.toLocaleDateString(LOCALE);
    const dataOpExt = data.toLocaleString(LOCALE, {
          day: '2-digit',
          month: 'long'
        })
    const horaOp = data.toLocaleTimeString(LOCALE, {
      hour: "2-digit",
      minute: "2-digit"
    });

    const dataOpShort = data.toLocaleString(LOCALE, {
      day: '2-digit',
      month: '2-digit'
    })

    const dataOpShortYear = data.toLocaleString(LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    return { dataOp, horaOp, dataOpExt, dataOpShort, dataOpShortYear };
  }

  normalizeData(data: Date): Date {
    return new Date(data.getFullYear(), data.getMonth(), data.getDay());
  }

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
    return parseFloat(valor.replace('.','').replace(',','.'))
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

  filtraDataPG = (date: Date | null): boolean => {
    const day = (date || new Date()).getDay();
    const todayTime = new Date().getTime();
    const dateTime = (date || new Date()).getTime();
    return day !== 0 && day !== 6 && dateTime <= todayTime;
  };

  alertClass(data: Date, pago?: boolean, prefix: string = 'alert'): string {
    const hoje = new Date();
    const hojeTime = this.normalizeData(hoje).getTime();
    const vencimento = this.normalizeData(data).getTime();
    if(pago) return `${prefix}-secondary`;
    if(hojeTime > vencimento) return `${prefix}-danger`;
    if(hojeTime < vencimento) return `${prefix}-secondary`;
    return `${prefix}-warning`;
  }
}
