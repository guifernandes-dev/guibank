import { Component, inject } from '@angular/core';
import { LoginService } from '../../../../core/login.services/login.service';
import { BrCurrencyPipe } from '../../../../pipe/br-currency.pipe';
import { OperationService } from '../../transfer/services/operation.service';
import { MatIconModule } from '@angular/material/icon';
import { TableObj } from '../models/keys-table.model';
import { MenuOperation, TransAccount } from '../../transfer/models/operation.models';
import { Operation } from '../../../../../server/constants/operation.enum';

@Component({
  selector: 'app-table',
  imports: [BrCurrencyPipe, MatIconModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  private loginService = inject(LoginService);
  private operationService = inject(OperationService);

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
        const dataOpDate = new Date(op.data);
        const dataAtual = new Date().toLocaleDateString();
        const dataOp = dataOpDate.toLocaleDateString();
        const dataAnterior = dataOpDate.toLocaleString("pt-BR", {
          day: '2-digit',
          month: 'long'
        })
        const horaOp = dataOpDate.toLocaleString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit"
        });
        const descricao = op.descricao;
        const data = dataOp === dataAtual ? horaOp : dataAnterior;
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

  private formatarDataHora(iso: string) {
    const d = new Date(iso);

    const data = d.toLocaleDateString("pt-BR");
    const hora = d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    return { data, hora };
  }

}
