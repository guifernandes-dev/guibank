import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrCurrencyPipe } from '../../../pipe/br-currency.pipe';
import { DateTransPipe } from '../../../pipe/date-trans.pipe';
import { LoginService } from '../../../core/login.services/login.service';
import { DateFormats } from '../../../constants/front.enum';
import { TipoTransPipe } from '../../../pipe/tipo-trans.pipe';
import { RecebedorPipe } from '../../../pipe/recebedor.pipe';
import { Transaction } from '../../../../server/models/db.model';
import { Operation } from '../../../../server/constants/db.enum';

@Component({
  selector: 'app-transactions-list',
  imports: [MatIconModule, MatButtonModule, BrCurrencyPipe, DateTransPipe, TipoTransPipe, RecebedorPipe],
  templateUrl: './transactions-list.component.html',
  styleUrl: './transactions-list.component.css'
})
export class TransactionsListComponent {
  private readonly loginService = inject(LoginService);

  get user() {
    return this.loginService.user;
  }

  get dateFormats() {
    return DateFormats;
  }

  get operation() {
    return Operation;
  }

  get transactions2() {
    const mapa = this.loginService.userOp()
      .filter(op => op.pago)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .reduce((acc, op) => {
        const data = op.data.toDateString();
        if (!acc[data]) {
          acc[data] = [];
        }

        acc[data].push(op);

        return acc;

      },{} as Record<string, any[]>)
    return Object.entries(mapa).map(([data, dados]) => ({
      data: new Date(data),
      dados
    })) as unknown as { data: Date, dados: Transaction[]}[];
  }

  get transactions() {
    const operacoes = this.loginService.userOp()
      .filter(op => op.pago)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()); // crescente

    // 1. Agrupar por data
    const mapa = operacoes.reduce((acc, op) => {
      const data = op.data.toDateString();

      if (!acc[data]) {
        acc[data] = {
          data: new Date(data),
          dados: [],
          saldoHoje: 0,
          saldoAcumulado: 0
        };
      }

      acc[data].dados.push(op);

      // 2. Somar saldo do dia (entrada positiva, saída negativa)
      const mult = op.origem?.conta === this.user()?.conta
        ? -1
        : 1
      acc[data].saldoHoje += op.valor * mult;

      return acc;
    },
    {} as Record<string, {
      data: Date;
      dados: any[];
      saldoHoje: number;
      saldoAcumulado: number;
    }>);
    
    // 3. Transformar em array ordenado por data
    const dias = Object.values(mapa).sort((a, b) => a.data.getTime() - b.data.getTime());

    // 4. Calcular saldo acumulado
    let saldoAnterior = 0;

    dias.forEach(dia => {
      dia.saldoAcumulado = saldoAnterior + dia.saldoHoje;
      saldoAnterior = dia.saldoAcumulado;
    });

    return dias.sort((a, b) => b.data.getTime() - a.data.getTime());;
  }
}
