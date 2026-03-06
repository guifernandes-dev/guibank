import { Routes } from '@angular/router';
import { DashboardComponent } from './main-panel/pages/dashboard/dashboard.component';
import { Pages } from './constants/front.enum';
import { TransferComponent } from './main-panel/pages/transfer/transfer.component';
import { TransactionsListComponent } from './main-panel/pages/transactions-list/transactions-list.component';
import { DocumentListComponent } from './main-panel/pages/document-list/document-list.component';
import { LoanComponent } from './main-panel/pages/loan/loan.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { MainPanelComponent } from './main-panel/main-panel.component';
import { LoginComponent } from './login/login.component';
import { loginGuard } from './core/auth/login.guard';
import { authGuard } from './core/auth/auth.guard';
import { Operation } from '../server/constants/db.enum';

export const routes: Routes = [
  {
    path: '',
    component: MainPanelComponent,
    canActivate: [authGuard],
    children: [
      {
        path: Pages.DASHBOARD,
        component: DashboardComponent,
      },
      {
        path: Pages.STATEMENTS,
        component: TransactionsListComponent,
      },
      {
        path: Pages.OPERATIONS,
        component: TransferComponent,
        children: [
          {
            path: Operation.PIX,
            component: TransferComponent
          },
          {
            path: Operation.DEPOSITO,
            component: TransferComponent
          },
          {
            path: Operation.SAQUE,
            component: TransferComponent
          },
          {
            path: Operation.DEBITO,
            component: TransferComponent
          },
          {
            path: Operation.PAGAMENTO,
            component: TransferComponent
          },
          {
            path: '',
            redirectTo: Operation.PIX,
            pathMatch: 'full'
          }
        ]
      },
      {
        path: Pages.DOCUMENTS,
        component: DocumentListComponent,
      },
      {
        path: Pages.LOAN,
        component: LoanComponent,
      },
      {
        path: '',
        redirectTo: Pages.DASHBOARD,
        pathMatch: 'full'
      },
    ]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard] },
  {
    path: '**',
    component: NotFoundComponent
  }
]