import { Component, inject } from '@angular/core';
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { TransactionsListComponent } from "./pages/transactions-list/transactions-list.component";
import { Pages } from '../constants/pages.enum';
import { TransferComponent } from "./pages/transfer/transfer.component";
import { CreditComponent } from "./pages/credit/credit.component";
import { RouterService } from '../core/router.services/router.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-main-panel',
  imports: [DashboardComponent, TransactionsListComponent, TransferComponent, CreditComponent, AsyncPipe],
  templateUrl: './main-panel.component.html',
  styleUrl: './main-panel.component.css'
})
export class MainPanelComponent {
  private readonly routerService = inject(RouterService);
  currentPage$: Observable<Pages> = this.routerService.currentPage;
  pages = Pages;
}
