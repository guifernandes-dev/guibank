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
      if (!user?.conta) return;
      this.loanService.getUserLoans(user.conta);
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

  getBalancoAtual(loan: Loan): LoanTotal {
    const totais: LoanTotal = {amortizacao: 0, juros: 0, parcela: 0, saldo: loan.valor};
    return loan.parcelas
      .filter(({pago}) => pago)
      .reduce((acc, parc) => {
        const amortizacao = acc.amortizacao + parc.amortizacao;
        const juros = acc.juros + parc.juros;
        const parcela = acc.parcela + parc.parcela;
        const saldo = acc.saldo - parc.amortizacao;
        return {amortizacao, juros, parcela, saldo};
      }, totais)
  }
}
