import { Component, inject } from '@angular/core';
import { LoginService } from '../../../../../core/login.services/login.service';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { OperationService } from '../../../transfer/services/operation.service';
import { MatIconModule } from '@angular/material/icon';
import { TableObj } from '../../models/dash.model';
import { MenuOperation, TransAccount } from '../../../transfer/models/operation.models';
import { Operation } from '../../../../../../server/constants/operation.enum';
import { UtilService } from '../../../../../core/util.services/util.service';

@Component({
  selector: 'app-table',
  imports: [BrCurrencyPipe, MatIconModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  private readonly loginService = inject(LoginService);
  private readonly operationService = inject(OperationService);
  private readonly utilService = inject(UtilService);

  get user() {
    return this.loginService.user;
  }

  get data() {
    return this.loginService.userOp()
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .filter(op => op.pago)
      .slice(0,3)
      .map((op): TableObj  => {
        const userConta = this.user()?.conta;
        const valor = op.valor * (op.origem?.conta === userConta ? -1 : 1);
        const recebedor = op.destino?.conta === this.user()?.conta
          ? op.origem
          : op.destino;
        const tipo = this.operationService.operationMenu.find(item => item.operation === op.tipo)!;
        const dataAtual = new Date().toLocaleDateString();
        const {dataOp, horaOp, dataOpExt } = this.utilService.formatarDataHora(op.data);
        const descricao = op.descricao;
        const data = dataOp === dataAtual ? horaOp : dataOpExt;
        return {data, tipo, recebedor, valor, descricao};
      });
  }

  getRecebedor(recebedor: TransAccount | null): string {
    if (!recebedor) return '';
    if (recebedor.conta === this.user()?.conta) return '';
    return `${recebedor.nome}`
  }

  getTipo({tipo, valor}: TableObj): string {
    if(tipo.operation === Operation.PIX) {
      if (valor>0) {
        return `RECEBIMENTO POR ${tipo.label}`
      }
      return `PAGAMENTO POR ${tipo.label}`
    }
    return tipo.label
  }
}
