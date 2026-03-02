import { Component, inject } from '@angular/core';
import { LoginService } from '../../../../../core/login.services/login.service';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { MatIconModule } from '@angular/material/icon';
import { DateFormats } from '../../../../../constants/pages.enum';
import { RecebedorPipe } from '../../../../../pipe/recebedor.pipe';
import { DateTransPipe } from '../../../../../pipe/date-trans.pipe';
import { TipoTransPipe } from '../../../../../pipe/tipo-trans.pipe';
import { Operation } from '../../../../../../server/constants/operation.enum';

@Component({
  selector: 'app-table',
  imports: [BrCurrencyPipe, MatIconModule, RecebedorPipe, DateTransPipe, TipoTransPipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  private readonly loginService = inject(LoginService);
  dateFormats = DateFormats;

  get operation() {
    return Operation;
  }

  get user() {
    return this.loginService.user
  }

  get data() {
    const ops = this.loginService.userOp()
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .filter(op => op.pago)
      .slice(0,3)
    return ops;
  }
}
