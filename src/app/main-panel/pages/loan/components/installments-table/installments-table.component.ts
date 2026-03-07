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
import { SisCredito } from '../../../../../../server/constants/db.enum';
import { UtilService } from '../../../../../core/util.services/util.service';

@Component({
  selector: 'app-installments-table',
  imports: [AlertClassPipe,DateTransPipe,BrCurrencyPipe,MatIconModule, MatButtonModule, RouterLink, MatTooltipModule],
  templateUrl: './installments-table.component.html',
  styleUrl: './installments-table.component.css'
})
export class InstallmentsTableComponent {
  private loanService = inject(LoanService);
  private readonly loginService = inject(LoginService);
  private readonly utilService = inject(UtilService);
  private route = inject(ActivatedRoute);
  readonly loan$ = signal<Loan | null>(null)
  presentValue$ = signal<{item: number, parcela: number}[]>([]);

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      const loans = this.loanService.userLoans$();
      let loan: Loan | undefined;
      if (id) {
        loan = loans.find(loan => loan.id === id);
      } else {
        loan = this.loanService.loan$();
      }
      if(!loan) return;
      this.loan$.set(loan)
      this.parcelasHoje(loan);
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

  parcelasHoje(loan: Loan) {
    const parcelasHoje = loan.parcelas
      .filter(p=>!p.pago)
      .map(({vencimento, parcela, item, amortizacao, juros}) => {
      const umDia = 1000 * 60 * 60 * 24;
      const vencimentoData = new Date(vencimento.getFullYear(), vencimento.getMonth(), vencimento.getDate());
      const hoje= new Date();
      const hojeData = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      const mesAnterior = item === 1 ? loan.data : loan.parcelas[item-2].vencimento;
      const diffMs = hojeData.getTime() - mesAnterior.getTime();
      const diasAtraso = Math.round(diffMs / umDia);
      console.log(mesAnterior,diasAtraso);
      
      const taxadia = this.utilService.converteTax(loan.taxa,1,30,1);

      if(diasAtraso>0) {
        const jurosAoDia = loan.taxa / 30; // mercado usa 30 dias
        const valorMulta = parcela * 0.02;
        const valorJuros = parcela * jurosAoDia * (diasAtraso);
        return {item, parcela: parcela + valorMulta + valorJuros};
      }
      if(diasAtraso<-30) {
        return {item, parcela: amortizacao};
      }
      const saldo = item === 1 ? loan.valor : loan.parcelas[item-2].amortizacao;
      const vf = saldo * Math.pow(1 + taxadia, diasAtraso*-1);
      const j = vf - saldo;
      return {item, parcela: amortizacao + j};
    })
    this.presentValue$.set(parcelasHoje);
  }

  parcelaHoje(item: number) {
    const parcela = this.presentValue$()
      .find(parc => parc.item === item);
    if(!parcela) return 0;
    return parcela.parcela;
  }

  totalHoje(): number {
    const presValue = this.presentValue$();
    if(!presValue.length) return 0;
    return this.presentValue$().reduce((soma, parcela)=>{
      return soma+parcela.parcela;
    },0)
  }

  quitar(id: string) {

  }

  pagar(id: string, parc: Installment) {

  }
}
