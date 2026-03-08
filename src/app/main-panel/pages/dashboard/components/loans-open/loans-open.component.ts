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
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateFormats } from '../../../../../constants/front.enum';
import { Installment } from '../../../../../../server/models/db.model';
import { DashboardService } from '../../services/dashboard.service';
import { LoanService } from '../../../loan/services/loan.service';
import { InstallmentCard } from '../../../../../core/models/services.model';

@Component({
  selector: 'app-loans-open',
  imports: [MatIconModule, MatCardModule, MatButtonModule, BrCurrencyPipe, DateTransPipe, AlertClassPipe],
  templateUrl: './loans-open.component.html',
  styleUrl: './loans-open.component.css'
})
export class LoansOpenComponent {
  private readonly loginService = inject(LoginService);
  private readonly dashService = inject(DashboardService);
  private readonly loanService = inject(LoanService);
  private readonly transService = inject(TransactionsService);
  private readonly utilService = inject(UtilService);
  private snackBar = inject(MatSnackBar);
  
  get dateFormats() {
    return DateFormats;
  }

  get user() {
    return this.loginService.user;
  }

  get saldo() {
    return this.transService.saldo;
  }

  get parcelas() {
    return this.dashService.getParcelas();
  }

  pagar(parc: InstallmentCard): void {
    const loans = this.loanService.userLoans$(); 
    const index = loans.findIndex(loan => loan.id === parc.loanId);
    if(index<0) return;
    // console.log(loans[index]);
    
    const valorHoje = this.utilService.parcelaHoje(parc,loans[index]);
    const parcHoje = {
      ...parc,
      parcela: valorHoje,
      juros: valorHoje - parc.amortizacao,
    }
    if(parcHoje.parcela > this.saldo) {
      this.snackBar.open(
        'Saldo inferior ao valor do documento!',
        'Ok',
        {
          duration: this.utilService.duration,
          panelClass: 'snackbar-erro'
        }
      );
      return;
    }
    console.log(parcHoje);
    
    // this.transService.payTrans(parc);
  }
}
