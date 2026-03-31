import { Component, effect, inject, signal, TemplateRef } from '@angular/core';
import { Installment, Loan, LoanTotal } from '../../../../../../server/models/db.model';
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
import { UtilService } from '../../../../../core/util.services/util.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogPayLoanComponent } from '../../../../../shared/dialog-pay-loan/dialog-pay-loan.component';
import { TransactionsService } from '../../../../../core/transactions.services/transactions.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-installments-table',
  imports: [AlertClassPipe,DateTransPipe,BrCurrencyPipe,MatIconModule, MatButtonModule, RouterLink, MatTooltipModule, TranslatePipe],
  templateUrl: './installments-table.component.html',
  styleUrl: './installments-table.component.css'
})
export class InstallmentsTableComponent {
  private readonly loanService = inject(LoanService);
  private readonly utilService = inject(UtilService);
  private readonly transService = inject(TransactionsService);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  readonly loan$ = signal<Loan | null>(null)
  presentValue$ = signal<{item: number, parcela: number}[]>([]);

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      let loan: Loan | undefined;
      
      if (id) {
        const loans = this.loanService.userLoans$();        
        loan = loans.find(loan => loan.id === id);
      } else {
        loan = this.loanService.loan$();
      }
      if(!loan) return;
      this.loan$.set(loan)
      this.parcelasHoje(loan);
    });
  }

  get dateFormats() {
    return DateFormats;
  }

  get lang() {
    return this.utilService.langAtual;
  }

  parcelasHoje(loan: Loan) {
    const parcelasHoje = loan.parcelas
      .filter(p=>!p.pago)
      .map(parc => ({
        item: parc.item,
        parcela: this.utilService.parcelaHoje(parc,loan)
      }));
    this.presentValue$.set(parcelasHoje);
  }

  parcelaHoje(item: number): number {
    const parcHoje = this.presentValue$();
    const index = parcHoje
      .findIndex(parc => parc.item === item);
    if(!parcHoje[index]) return 0;
    return parcHoje[index].parcela;
  }

  totalHoje(): number {
    const presValue = this.presentValue$();
    if(!presValue.length) return 0;
    return this.presentValue$().reduce((soma, parcela)=>{
      return soma+parcela.parcela;
    },0)
  }

  quitar(template: TemplateRef<any>) {
    let saldo = this.totalHoje();
    const saldoUser = this.transService.saldo;
    if(saldo > saldoUser) {
      const message = this.translate.instant('LOAN.SNACKS.BALANCE_SETTLE');
      this.utilService.openSnackBar(message)
      return;
    }
    const loan = this.loan$();
    if(!loan) {
      const message = this.translate.instant('LOAN.SNACKS.LOAN_NOT_FOUND');
      this.utilService.openSnackBar(message)
      return;
    };
    const dialogRef = this.dialog.open(DialogPayLoanComponent,{data: { obj: loan, template}});
    dialogRef.afterClosed().subscribe((loan: Loan) => {
      if(!loan) return;
      const parcelas = loan.parcelas.map(parc => {
        if(parc.pago) {
          return parc
        };
        const parcHoje = this.parcelaHoje(parc.item);    
        const newParc = {
          ...parc,
          pago: true,
          saldo: saldo - parcHoje,
          juros: parcHoje - parc.amortizacao,
          parcela: parcHoje,
        }
        saldo -= newParc.amortizacao;
        return newParc;
      });
      const newLoan: Loan = {
        ...loan,
        pago: true,
        parcelas,
      };
      this.loan$.set(newLoan);
      this.presentValue$.set([])
      this.loanService.patchLoan(newLoan,undefined,saldo);
    });
  }

  pagar(parcelaChange: Installment, template: TemplateRef<any>) {
    const parcela = this.parcelaHoje(parcelaChange.item);
    if(parcela > this.transService.saldo) {
      const message = this.translate.instant('LOAN.SNACKS.BALANCE_INSTALLMENT');
      this.utilService.openSnackBar(message);
      return;
    }
    const dialogRef = this.dialog.open(DialogPayLoanComponent,{
      data: {obj: {...parcelaChange, parcela}, template}
    });
    dialogRef.afterClosed().subscribe((parc: Installment) => {
      if(!parc) return;
      this.loan$.update((loan =>{
        if(!loan?.parcelas.length) return loan;
        const {amortizacao} = loan.parcelas[parc.item-1];
        const parcelas = [...loan.parcelas];
        const juros = parcela-amortizacao;
        const index = loan.parcelas.findIndex(parc => parc.item === parc.item);
        parcelas[index] = {
          ...loan.parcelas[index],
          pago: true,
          juros,
          parcela,
        }
        return {...loan,parcelas}
      }));
      this.presentValue$.update(presValue => {
        return presValue.filter(({item}) => item !== parc.item);
      });
      this.loanService.patchLoan(this.loan$()!, parc);
    });
  }

  getBalanco(): LoanTotal {
    const loan = this.loan$();
    if(!loan) return {amortizacao: 0, juros: 0, parcela: 0, saldo: 0}
    return this.loanService.getBalanco(loan, 'total');
  }
}
