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
import { MatSnackBar } from '@angular/material/snack-bar';

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
  private readonly transService = inject(TransactionsService);
  private readonly dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  readonly loan$ = signal<Loan | null>(null)
  presentValue$ = signal<{item: number, parcela: number}[]>([]);

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      const user = this.loginService.user();
      if (!user?.conta || !id) return;
      this.loanService.getUserLoans(user.conta);
    });
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
    const total = this.totalHoje();
    const saldo = this.transService.saldo;
    if(total > saldo) {
      this.snackBar.open(
        'Saldo inferior ao valor de quitação do contrato!',
        'Ok',
        {
          duration: this.utilService.duration,
          panelClass: 'snackbar-erro'
        }
      );
      return;
    }
    const loan = this.loan$();
    const totais = { juros: 0, amortizacao: 0, parcela: 0, saldo: total};    
    const parcelas = loan?.parcelas.map(parc => {
      if(parc.pago) {
        totais.juros += parc.juros;
        totais.amortizacao += parc.amortizacao;
        totais.parcela += parc.parcela;
        return parc
      };
      const parcHoje = this.parcelaHoje(parc.item);    
      const newParc = {
        ...parc,
        pago: true,
        saldo: totais.saldo - parcHoje,
        juros: parcHoje - parc.amortizacao,
        parcela: parcHoje,
      }
      totais.juros += newParc.juros;
      totais.amortizacao += newParc.amortizacao;
      totais.parcela += newParc.parcela;
      totais.saldo -= newParc.amortizacao;
      return newParc;
    })
    const newLoan = {
      ...this.loan$(),
      pago: true,
      atuais: totais,
      totais: totais,
      parcelas,
    };
    const dialogRef = this.dialog.open(DialogPayLoanComponent,{data: { obj: newLoan, template}});
    dialogRef.afterClosed().subscribe((loan: Loan) => {
      if(!loan) return;
      this.loan$.set(loan);
      this.presentValue$.set([])
      this.loanService.patchLoan(loan,undefined,total);
    });
  }

  pagar(parcelaChange: Installment, template: TemplateRef<any>) {
    const parcela = this.parcelaHoje(parcelaChange.item);
    const saldo = this.transService.saldo;
    if(parcela > saldo) {
      this.snackBar.open(
        'Saldo inferior ao valor da parcela!',
        'Ok',
        {
          duration: this.utilService.duration,
          panelClass: 'snackbar-erro'
        }
      );
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
        const atuais: LoanTotal = {
          amortizacao: loan.atuais.amortizacao + amortizacao,
          juros: loan.atuais.juros + juros,
          parcela: loan.atuais.parcela + parcela,
          saldo: loan.atuais.saldo - parcela,
        }
        const index = loan.parcelas.findIndex(parc => parc.item === parc.item);
        parcelas[index] = {
          ...loan.parcelas[index],
          pago: true,
          juros,
          parcela,
        }
        return {
          ...loan,
          atuais,
          parcelas,
        }
      }));
      this.presentValue$.update(presValue => {
        return presValue.filter(({item}) => item !== parc.item);
      });
      this.loanService.patchLoan(this.loan$()!, parc);
    });
  }
}
