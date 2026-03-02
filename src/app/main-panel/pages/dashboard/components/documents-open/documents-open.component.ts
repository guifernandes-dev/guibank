import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LoginService } from '../../../../../core/login.services/login.service';
import { OperationService } from '../../../transfer/services/operation.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { UtilService } from '../../../../../core/util.services/util.service';
import { TransactionsService } from '../../../../../core/transactions.services/transactions.service';
import { Transaction } from '../../../../../../server/models/db.model';
import { TipoTransPipe } from '../../../../../pipe/tipo-trans.pipe';
import { DateTransPipe } from '../../../../../pipe/date-trans.pipe';
import { DateFormats } from '../../../../../constants/pages.enum';
import { AlertClassPipe } from '../../../../../pipe/alert-class.pipe';

@Component({
  selector: 'app-documents-open',
  imports: [MatIconModule, MatCardModule, MatButtonModule, BrCurrencyPipe, TipoTransPipe, DateTransPipe, AlertClassPipe ],
  templateUrl: './documents-open.component.html',
  styleUrl: './documents-open.component.css'
})
export class DocumentsOpenComponent {
  private readonly loginService = inject(LoginService);
  private readonly operationService = inject(OperationService);
  private readonly utilService = inject(UtilService);
  private readonly transService = inject(TransactionsService);
  
  get dateFormats() {
    return DateFormats;
  }

  get user() {
    return this.loginService.user;
  }

  get documents() {
    const hoje = new Date();
    const doisMesesDepois = new Date(hoje);
    doisMesesDepois.setMonth(hoje.getMonth()+2);
    return this.loginService.userOp()
      .filter(op => op.vencimento && !op.pago)
      .filter(op => new Date(op.vencimento!).getTime() <= doisMesesDepois.getTime())
      .sort((a, b) => new Date(a.vencimento!).getTime() - new Date(b.vencimento!).getTime())
      .slice(0,3);
  }

  pagar(trans: Transaction): void {
    this.transService.patchTrans(trans);
  }

  
}
