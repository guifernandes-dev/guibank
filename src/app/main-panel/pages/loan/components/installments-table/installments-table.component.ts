import { Component, effect, inject, signal } from '@angular/core';
import { Installment, Loan } from '../../../../../../server/models/db.model';
import { AlertClassPipe } from '../../../../../pipe/alert-class.pipe';
import { DateTransPipe } from '../../../../../pipe/date-trans.pipe';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { DateFormats } from '../../../../../constants/front.enum';
import { MatIconModule } from '@angular/material/icon';
import { LoanService } from '../../services/loan.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoginService } from '../../../../../core/login.services/login.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-installments-table',
  imports: [AlertClassPipe,DateTransPipe,BrCurrencyPipe,MatIconModule, MatButtonModule, RouterLink, MatTooltipModule],
  templateUrl: './installments-table.component.html',
  styleUrl: './installments-table.component.css'
})
export class InstallmentsTableComponent {
  private loanService = inject(LoanService);
  private readonly loginService = inject(LoginService);
  private route = inject(ActivatedRoute);
  readonly loan$ = signal<Loan | null>(null)
  presentValue$ = signal(0);

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      const loans = this.loanService.userLoans$();
      if (id) {
        this.loan$.set(loans.find(loan => loan.id === id)!)
      } else {
        this.loan$.set(this.loanService.loan$());
      }
    });
    effect(() => {
      const user = this.loginService.user();
      if (!user?.conta) return;
      this.loanService.getUserLoans(user.conta);
    });
  }

  get dateFormats() {
    return DateFormats;
  }

  quitar(id: string) {

  }

  pagar(id: string, parc: Installment) {

  }
}
