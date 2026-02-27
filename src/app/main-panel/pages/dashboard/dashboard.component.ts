import { Component, inject, OnInit, signal} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { TransactionsService } from '../transactions-list/services/transactions.service';
import { BrCurrencyPipe } from '../../../pipe/br-currency.pipe';
import { TableComponent } from "./table/table.component";
import { LoginService } from '../../../core/login.services/login.service';
import { Transaction } from '../../../../server/models/db.model';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, BrCurrencyPipe, TableComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private transService = inject(TransactionsService);

  get saldo() {
    return this.transService.saldo;
  }

  get receitas() {
    return this.transService.saldoRec;
  }
  get despesas() {
    return this.transService.saldoDesp;
  }
}
