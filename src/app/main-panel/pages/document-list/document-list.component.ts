import { Component, inject } from '@angular/core';
import { LoginService } from '../../../core/login.services/login.service';
import { MatIconModule } from "@angular/material/icon";
import { BrCurrencyPipe } from '../../../pipe/br-currency.pipe';
import { MatButtonModule } from "@angular/material/button";
import { TransactionsService } from '../../../core/transactions.services/transactions.service';
import { Transaction } from '../../../../server/models/db.model';
import { TipoTransPipe } from '../../../pipe/tipo-trans.pipe';
import { DateTransPipe } from '../../../pipe/date-trans.pipe';
import { DateFormats } from '../../../constants/front.enum';
import { AlertClassPipe } from '../../../pipe/alert-class.pipe';
import { UtilService } from '../../../core/util.services/util.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-document-list',
  imports: [MatIconModule, BrCurrencyPipe, MatButtonModule, TipoTransPipe, DateTransPipe, AlertClassPipe, MatTooltipModule, TranslatePipe],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.css'
})
export class DocumentListComponent {
  private readonly utilService = inject(UtilService);
  private readonly loginService = inject(LoginService);
  private readonly transService = inject(TransactionsService);

  get user() {
    return this.loginService.user;
  }

  get saldo() {
    return this.transService.saldo;
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

  get lang() {
    return this.utilService.langAtual;
  }

  pagar(trans: Transaction) {
    if(trans.valor > this.saldo) {
      this.utilService.openSnackBar('Saldo inferior ao valor do documento!');
      return;
    }
    this.transService.payTrans(trans);
  }

  editar(trans: Transaction) {
    this.transService.editTrans(trans);
  }

  deletar(trans: Transaction) {
    this.transService.deleteTrans(trans);
  }
}
