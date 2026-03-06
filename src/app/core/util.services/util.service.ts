import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  readonly duration = 5000;
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

  round(n: number, digits: number): number {
    const mult = 1 * 10 ** digits;
    return Math.round(n*mult)/mult;
  }
}
