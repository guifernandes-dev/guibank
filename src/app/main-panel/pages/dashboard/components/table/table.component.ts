import { Component, inject } from '@angular/core';
import { LoginService } from '../../../../../core/login.services/login.service';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { MatIconModule } from '@angular/material/icon';
import { DateFormats } from '../../../../../constants/front.enum';
import { RecebedorPipe } from '../../../../../pipe/recebedor.pipe';
import { DateTransPipe } from '../../../../../pipe/date-trans.pipe';
import { TipoTransPipe } from '../../../../../pipe/tipo-trans.pipe';
import { Operation } from '../../../../../../server/constants/db.enum';
import { DashboardService } from '../../services/dashboard.service';
import { Transaction } from '../../../../../../server/models/db.model';

@Component({
  selector: 'app-table',
  imports: [BrCurrencyPipe, MatIconModule, RecebedorPipe, DateTransPipe, TipoTransPipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  private readonly loginService = inject(LoginService);
  private readonly dashService = inject(DashboardService);
  dateFormats = DateFormats;
  private readonly BLUR_TRANS: Transaction[] = [
    {
      id: "b910",
      origem: null,
      destino: {
        id: '0',
        email: 'xablau@email.com',
        nome: 'Xablau da Silva'
      },
      data: new Date("2026-02-27T12:53:15.293Z"),
      descricao: "Caixa Eletrônico",
      valor: 1000,
      tipo: Operation.DEPOSITO,
      pago: true,
      vencimento: null
    },
    {
      id: "782c",
      origem: null,
      destino: {
        id: this.loginService.user()?.id || '0',
        email: this.loginService.user()?.email || 'xablau@email.com',
        nome: this.loginService.user()?.nome || 'Xablau da Silva'
      },
      data: new Date("2026-02-27T12:55:27.189Z"),
      descricao: "Cheque",
      valor: 500,
      tipo: Operation.DEPOSITO,
      pago: true,
      vencimento: null
    },
    {
      id: "f717",
      origem: {
        id: this.loginService.user()?.id || '0',
        email: this.loginService.user()?.email || 'xablau@email.com',
        nome: this.loginService.user()?.nome || 'Xablau da Silva'
      },
      destino: {
        id: "0000",
        email: "xablau@email.com",
        nome: "Xablauzin Teste"
      },
      data: new Date("2026-02-27T12:58:39.411Z"),
      descricao: "Presente",
      valor: 200,
      tipo: Operation.PIX,
      pago: true,
      vencimento: null
    },
    {
      id: "f517",
      origem: {
        id: this.loginService.user()?.id || '0',
        email: this.loginService.user()?.email || 'xablau@email.com',
        nome: this.loginService.user()?.nome || 'Xablau da Silva'
      },
      destino: null,
      data: new Date("2026-02-28T12:59:15.980Z"),
      descricao: "Lanche",
      valor: 50,
      tipo: Operation.DEBITO,
      pago: true,
      vencimento: null
    }
  ].slice(0,this.loginService.userOp().length ? this.loginService.userOp().length : 4);

  get hidden() {
    return this.dashService.hidden;
  }

  get operation() {
    return Operation;
  }

  get user() {
    return this.loginService.user
  }

  get data() {
    if(!this.hidden()) return this.BLUR_TRANS;
    return this.loginService.userOp()
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .filter(op => op.pago)
      .map(trans =>{
        if(this.hidden()) return trans;
        return {
          ...trans,
          tipo: Operation.PIX
        }
      })
      .slice(0,4)
  }
}
