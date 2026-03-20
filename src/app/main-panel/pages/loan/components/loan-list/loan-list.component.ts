import { Component, effect, inject } from '@angular/core';
import { LoanService } from '../../services/loan.service';
import { DateTransPipe } from '../../../../../pipe/date-trans.pipe';
import { DateFormats } from '../../../../../constants/front.enum';
import { MatIconModule } from '@angular/material/icon';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from '../../../../../core/login.services/login.service';
import { RouterLink, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrPercentPipe } from '../../../../../pipe/br-percent.pipe';
import { Installment, Loan, LoanTotal } from '../../../../../../server/models/db.model';

@Component({
  selector: 'app-loan-list',
  imports: [DateTransPipe, MatIconModule, BrCurrencyPipe, MatButtonModule, RouterModule, MatTooltipModule, BrPercentPipe, RouterLink],
  templateUrl: './loan-list.component.html',
  styleUrl: './loan-list.component.css'
})
export class LoanListComponent {
  private readonly loanService = inject(LoanService);
  private readonly loginService = inject(LoginService);
    

  constructor() {
    effect(() => {
      const user = this.loginService.user();
      if (!user?.id) return;
      this.loanService.getUserLoans(user.id);
    });
  }

  ngOnInit(): void {
    this.loanService.initTax();
  }


  get dateFormats() {
    return DateFormats;
  }

  get loans() {
    return this.loanService.userLoans$;
  }

  statusParcelas(parcs: Installment[]): string {
    const numParcPg = parcs
      .filter(({pago}) => pago)
      .length
    return `${numParcPg}/${parcs.length}`
  }

  getProxParc(parcs: Installment[]): Installment {    
    return parcs
      .filter(({pago}) => !pago)
      .sort((a,b) => a.vencimento.getTime() - b.vencimento.getTime())[0]
  }

  isNewContract(parcs: Installment[]): boolean {
    return parcs.every(parc => !parc.pago);
  }

  getBalanco(loan: Loan): number {
    const balancoAtual = this.loanService.getBalanco(loan);
    const balancoTotal = this.loanService.getBalanco(loan,'total');
    return balancoTotal.parcela-balancoAtual.parcela;
  }
}
