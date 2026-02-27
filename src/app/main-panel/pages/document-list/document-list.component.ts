import { Component, inject } from '@angular/core';
import { LoginService } from '../../../core/login.services/login.service';
import { ListDocuments } from '../dashboard/models/dash.model';
import { OperationService } from '../transfer/services/operation.service';
import { UtilService } from '../../../core/util.services/util.service';
import { MatIcon } from "@angular/material/icon";
import { BrCurrencyPipe } from '../../../pipe/br-currency.pipe';

@Component({
  selector: 'app-document-list',
  imports: [MatIcon, BrCurrencyPipe],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.css'
})
export class DocumentListComponent {
  private readonly loginService = inject(LoginService);
  private readonly operationService = inject(OperationService);
  private readonly utilService = inject(UtilService);

  get user() {
    return this.loginService.user;
  }

  get docs() {
    return this.loginService.userOp()
      .filter(op => op.vencimento)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .map((op): ListDocuments  => {
        const valor = op.valor;
        const recebedor = op.destino?.conta === this.user()?.conta
          ? op.origem
          : op.destino;
        const tipo = this.operationService.operationMenu.find(item => item.operation === op.tipo)!;
        const {dataOpShortYear} = this.utilService.formatarDataHora(op.vencimento!);
        const descricao = op.descricao;
        const data = dataOpShortYear;
        const classCard = this.utilService.alertClass(
          new Date(op.vencimento!),
          op.pago,
          'table'
        );
        const id = op.id!;
        return {data, tipo, recebedor, valor, descricao, classCard, id, pago: op.pago};
      });
  }

  get openDocs() {
    return this.docs.filter(op => !op.pago)
  }

  get closeDocs() {
    return this.docs.filter(op => op.pago)
  }
}
