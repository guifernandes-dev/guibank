import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LoginService } from '../../../../../core/login.services/login.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { TransactionsService } from '../../../../../core/transactions.services/transactions.service';
import { Transaction } from '../../../../../../server/models/db.model';
import { TipoTransPipe } from '../../../../../pipe/tipo-trans.pipe';
import { DateTransPipe } from '../../../../../pipe/date-trans.pipe';
import { DateFormats } from '../../../../../constants/front.enum';
import { AlertClassPipe } from '../../../../../pipe/alert-class.pipe';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UtilService } from '../../../../../core/util.services/util.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-documents-open',
  imports: [MatIconModule, MatCardModule, MatButtonModule, BrCurrencyPipe, TipoTransPipe, DateTransPipe, AlertClassPipe],
  templateUrl: './documents-open.component.html',
  styleUrl: './documents-open.component.css'
})
export class DocumentsOpenComponent {
  private readonly loginService = inject(LoginService);
  private readonly dashService = inject(DashboardService);
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

  get documents() {
    return this.dashService.getDocuments();
  }

  pagar(trans: Transaction): void {
    if(trans.valor > this.saldo) {
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
    this.transService.payTrans(trans);
  }
}
