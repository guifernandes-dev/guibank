import { Component, inject } from '@angular/core';
import { LoginService } from '../../../../core/login.services/login.service';
import { BrCurrencyPipe } from '../../../../pipe/br-currency.pipe';
import { OperationService } from '../../transfer/services/operation.service';
import { MatIconModule } from '@angular/material/icon';
import { KeysTable } from '../models/keys-table.model';

@Component({
  selector: 'app-table',
  imports: [BrCurrencyPipe, MatIconModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  private loginService = inject(LoginService);
  private operationService = inject(OperationService);

  get data(): KeysTable[] {
    return this.loginService.userOp()
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .filter(op => op.pago)
      .slice(-4)
      .map((op): KeysTable  => {
        const userConta = this.loginService.user?.conta;
        const valor = op.valor * (op.origem === userConta ? -1 : 1);
        const recebedor = op.destino !== userConta ? op.destino : '';
        const tipo = this.operationService.operationMenu.find(item => item.operation === op.tipo)!;
        const data = new Date(op.data).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
        return {data, tipo, recebedor, valor};
      });
  }
  
  get keys() {
    const data = this.data;
    if(data.length) {
      const keys = Object.keys(data[0]) as unknown as (keyof KeysTable)[];
      return keys;
    }
    return [] as (keyof KeysTable)[]
  }
}
