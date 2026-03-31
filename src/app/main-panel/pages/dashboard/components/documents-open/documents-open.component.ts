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
import { UtilService } from '../../../../../core/util.services/util.service';
import { DashboardService } from '../../services/dashboard.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-documents-open',
  imports: [MatIconModule, MatCardModule, MatButtonModule, BrCurrencyPipe, TipoTransPipe, DateTransPipe, AlertClassPipe, TranslatePipe],
  templateUrl: './documents-open.component.html',
  styleUrl: './documents-open.component.css'
})
export class DocumentsOpenComponent {
  private readonly loginService = inject(LoginService);
  private readonly dashService = inject(DashboardService);
  private readonly transService = inject(TransactionsService);
  private readonly utilService = inject(UtilService);
  private readonly translate = inject(TranslateService);
  
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

  get lang() {
    return this.utilService.langAtual;
  }

  pagar(trans: Transaction): void {
    if(trans.valor > this.saldo) {
      const message = this.translate.instant('DASH.PAYMENTS.LOWER_BALANCE');
      this.utilService.openSnackBar(message);
      return;
    }
    this.transService.payTrans(trans);
  }
}
