import { Component, inject } from '@angular/core';
import { LoginService } from '../../../core/login.services/login.service';
import { MatIconModule } from "@angular/material/icon";
import { BrCurrencyPipe } from '../../../pipe/br-currency.pipe';
import { MatButtonModule } from "@angular/material/button";
import { TransactionsService } from '../../../core/transactions.services/transactions.service';
import { Transaction } from '../../../../server/models/db.model';
import { TipoTransPipe } from '../../../pipe/tipo-trans.pipe';
import { DateTransPipe } from '../../../pipe/date-trans.pipe';
import { DateFormats } from '../../../constants/pages.enum';
import { AlertClassPipe } from '../../../pipe/alert-class.pipe';

@Component({
  selector: 'app-document-list',
  imports: [MatIconModule, BrCurrencyPipe, MatButtonModule, TipoTransPipe, DateTransPipe, AlertClassPipe],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.css'
})
export class DocumentListComponent {
  private readonly loginService = inject(LoginService);
  private readonly transService = inject(TransactionsService);

  get user() {
    return this.loginService.user;
  }

  get dateFormats() {
    return DateFormats;
  }

  get hojeTime() {
    return new Date().getTime();
  }

  get docs() {
    return this.loginService.userOp()
      .filter(op => op.vencimento && !op.pago)
      .sort((a, b) => new Date(a.vencimento!).getTime() - new Date(b.vencimento!).getTime());
  }

  pagar(trans: Transaction) {
    this.transService.patchTrans(trans);
  }
}
