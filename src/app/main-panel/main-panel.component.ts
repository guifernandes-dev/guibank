import { Component, inject } from '@angular/core';
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { TransactionsListComponent } from "./pages/transactions-list/transactions-list.component";
import { Pages } from '../constants/pages.enum';
import { TransferComponent } from "./pages/transfer/transfer.component";
import { CreditComponent } from "./pages/credit/credit.component";
import { RouterService } from '../core/router.services/router.service';
import { DocumentListComponent } from "./pages/document-list/document-list.component";

@Component({
  selector: 'app-main-panel',
  imports: [DashboardComponent, TransactionsListComponent, TransferComponent, CreditComponent, DocumentListComponent],
  templateUrl: './main-panel.component.html',
  styleUrl: './main-panel.component.css'
})
export class MainPanelComponent {
  private readonly routerService = inject(RouterService);

  get currentPage() {
    return this.routerService.currentPage$
  };

  get pages() {
    return Pages
  };
}
