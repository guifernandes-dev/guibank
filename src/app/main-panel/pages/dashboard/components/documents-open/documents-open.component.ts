import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LoginService } from '../../../../../core/login.services/login.service';
import { OperationService } from '../../../transfer/services/operation.service';
import { CardDocuments } from '../../models/dash.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { UtilService } from '../../../../../core/util.services/util.service';
import { TransactionsService } from '../../../../../core/transactions.services/transactions.service';

@Component({
  selector: 'app-documents-open',
  imports: [MatIconModule, MatCardModule, MatButtonModule, BrCurrencyPipe],
  templateUrl: './documents-open.component.html',
  styleUrl: './documents-open.component.css'
})
export class DocumentsOpenComponent {
  private readonly loginService = inject(LoginService);
  private readonly operationService = inject(OperationService);
  private readonly utilService = inject(UtilService);
  private readonly transService = inject(TransactionsService);
  
  

  get user() {
    return this.loginService.user;
  }

  get data() {
    return this.loginService.userOp()
      .filter(op => op.vencimento && !op.pago)
      .sort((a, b) => new Date(a.vencimento!).getTime() - new Date(b.vencimento!).getTime())
      .slice(0,3)
      .map((op): CardDocuments  => {
        const valor = op.valor;
        const recebedor = op.destino?.conta === this.user()?.conta
          ? op.origem
          : op.destino;
        const tipo = this.operationService.operationMenu.find(item => item.operation === op.tipo)!;
        const {dataOpShort} = this.utilService.formatarDataHora(op.vencimento!);
        const descricao = op.descricao;
        const data = dataOpShort;
        const classCard = this.utilService.alertClass(new Date(op.vencimento!));
        const id = op.id!;
        return {data, tipo, recebedor, valor, descricao, classCard, id};
      });
  }

  pagar(trans: CardDocuments): void {
    this.transService.patchTrans(trans);
  }

  
}
