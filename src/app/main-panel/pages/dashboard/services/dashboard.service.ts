import { inject, Injectable, signal } from '@angular/core';
import { LoginService } from '../../../../core/login.services/login.service';
import { NextCards } from '../../../../constants/front.enum';
import { LoanService } from '../../loan/services/loan.service';
import { InstallmentCard } from '../../../../core/models/services.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly loginService = inject(LoginService);
  private readonly loanService = inject(LoanService);
  nextSelec$ = signal(NextCards.NULL);
  readonly hidden = signal(true);
  notificacoes$ = signal({
    parc: 0,
    doc: 0,
  });

  getDocuments() {
    const hoje = new Date();
    const doisMesesDepois = new Date(hoje);
    doisMesesDepois.setMonth(hoje.getMonth()+2);
    return this.loginService.userOp()
      .filter(op => op.vencimento && !op.pago)
      .filter(op => new Date(op.vencimento!).getTime() <= doisMesesDepois.getTime())
      .sort((a, b) => new Date(a.vencimento!).getTime() - new Date(b.vencimento!).getTime())
      .slice(0,4);
  }

  getParcelas(): InstallmentCard[] {
    const hoje = new Date();
    const doisMesesDepois = new Date(hoje);
    doisMesesDepois.setMonth(hoje.getMonth()+2);
    return this.loanService.userLoans$()
      .filter(p => !p.pago)
      .flatMap(loan => loan.parcelas
        .filter(p => !p.pago)
        .map(parc => {
          return {
            ...parc,
            loanId: loan.id!,
            title: 'DASH.PAYMENTS.INSTALLMENTS.TITLE',
            subtitle: 'DASH.PAYMENTS.INSTALLMENTS.SUBTITLE',
          }
        }))
      .filter(parc => new Date(parc.vencimento!).getTime() <= doisMesesDepois.getTime())
      .sort((a, b) => new Date(a.vencimento!).getTime() - new Date(b.vencimento!).getTime())
      .slice(0,4);
  }
}
