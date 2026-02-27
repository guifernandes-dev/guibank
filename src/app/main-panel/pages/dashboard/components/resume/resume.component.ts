import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TransactionsService } from '../../../../../core/transactions.services/transactions.service';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';

@Component({
  selector: 'app-resume',
  imports: [MatCardModule, BrCurrencyPipe],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.css'
})
export class ResumeComponent {
  private transService = inject(TransactionsService);

  get saldo() {
    return this.transService.saldo;
  }

  get receitas() {
    return this.transService.saldoRec;
  }
  get despesas() {
    return this.transService.saldoDesp;
  }
}
