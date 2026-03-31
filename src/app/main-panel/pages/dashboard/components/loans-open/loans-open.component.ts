import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { DateTransPipe } from '../../../../../pipe/date-trans.pipe';
import { AlertClassPipe } from '../../../../../pipe/alert-class.pipe';
import { LoginService } from '../../../../../core/login.services/login.service';
import { TransactionsService } from '../../../../../core/transactions.services/transactions.service';
import { UtilService } from '../../../../../core/util.services/util.service';
import { DateFormats } from '../../../../../constants/front.enum';
import { DashboardService } from '../../services/dashboard.service';
import { LoanService } from '../../../loan/services/loan.service';
import { InstallmentCard } from '../../../../../core/models/services.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogPayLoanResumeComponent } from '../../../../../shared/dialog-pay-loan-resume/dialog-pay-loan-resume.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-loans-open',
  imports: [MatIconModule, MatCardModule, MatButtonModule, BrCurrencyPipe, DateTransPipe, AlertClassPipe, TranslatePipe],
  templateUrl: './loans-open.component.html',
  styleUrl: './loans-open.component.css'
})
export class LoansOpenComponent {
  private readonly loginService = inject(LoginService);
  private readonly dashService = inject(DashboardService);
  private readonly loanService = inject(LoanService);
  private readonly transService = inject(TransactionsService);
  private readonly utilService = inject(UtilService);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(MatDialog);
  
  get dateFormats() {
    return DateFormats;
  }

  get user() {
    return this.loginService.user;
  }

  get parcelas() {
    return this.dashService.getParcelas();
  }

  get lang() {
    return this.utilService.langAtual;
  }

  pagar(parc: InstallmentCard): void {
    const loans = this.loanService.userLoans$(); 
    const index = loans.findIndex(loan => loan.id === parc.loanId);
    if(index<0) return;    
    const valorHoje = this.utilService.parcelaHoje(parc,loans[index]);
    const parcHoje = {
      ...parc,
      parcela: valorHoje,
      juros: valorHoje - parc.amortizacao,
    }
    if(parcHoje.parcela > this.transService.saldo) {
      const message = this.translate.instant('DASH.PAYMENTS.LOWER_BALANCE')
      this.utilService.openSnackBar(message);
      return;
    }
    const dialogRef = this.dialog.open(DialogPayLoanResumeComponent,{data: parcHoje});
    dialogRef.afterClosed().subscribe((parc: InstallmentCard) => {
      if(!parc) return;
      const loan = loans[index];
      const parcelas = [...loan.parcelas];
      const {amortizacao, parcela} = parc;
      const juros = parcela - amortizacao;
      const indexParc = loan.parcelas.findIndex(parc => parc.item === parc.item);
      parcelas[indexParc] = {
        ...loan.parcelas[indexParc],
        pago: true,
        juros,
        parcela,
      }
      const newLoan = {...loan,parcelas};      
      this.loanService.patchLoan(newLoan, parc);
    });
  }
}
