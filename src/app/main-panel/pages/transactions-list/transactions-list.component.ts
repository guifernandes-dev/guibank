import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrCurrencyPipe } from '../../../pipe/br-currency.pipe';
import { DateTransPipe } from '../../../pipe/date-trans.pipe';
import { LoginService } from '../../../core/login.services/login.service';
import { DateFormats } from '../../../constants/pages.enum';
import { TipoTransPipe } from '../../../pipe/tipo-trans.pipe';
import { AlertClassPipe } from '../../../pipe/alert-class.pipe';
import { RecebedorPipe } from '../../../pipe/recebedor.pipe';
import { Transaction } from '../../../../server/models/db.model';

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

  get operations() {
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
}
