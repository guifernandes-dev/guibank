import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TransactionsService } from '../../../../../core/transactions.services/transactions.service';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { DashboardService } from '../../services/dashboard.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoginService } from '../../../../../core/login.services/login.service';

@Component({
  selector: 'app-resume',
  imports: [MatCardModule, BrCurrencyPipe, MatProgressSpinnerModule],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.css'
})
export class ResumeComponent {
  private readonly transService = inject(TransactionsService);
  private readonly loginService = inject(LoginService);
  private readonly dashService = inject(DashboardService);

  get isLoading() {
    return this.loginService.isLoading;
  }

  get hidden() {
    return this.dashService.hidden;
  }

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
