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
import { loginGuard } from './core/guards/login.guard';
import { authGuard } from './core/guards/auth.guard';
import { Operation } from '../server/constants/db.enum';
import { OperationFormComponent } from './main-panel/pages/transfer/components/operation-form/operation-form.component';
import { operationGuard } from './core/guards/operation.guard';

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
            component: OperationFormComponent,
            canActivate: [operationGuard]
          },
          {
            path: Operation.DEPOSITO,
            component: OperationFormComponent,
            canActivate: [operationGuard]
          },
          {
            path: Operation.SAQUE,
            component: OperationFormComponent,
            canActivate: [operationGuard]
          },
          {
            path: Operation.DEBITO,
            component: OperationFormComponent,
            canActivate: [operationGuard]
          },
          {
            path: Operation.PAGAMENTO,
            component: OperationFormComponent,
            canActivate: [operationGuard]
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