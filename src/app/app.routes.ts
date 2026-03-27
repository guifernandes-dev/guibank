import { Routes } from '@angular/router';
import { Pages } from './constants/front.enum';
import { authGuard } from './core/guards/auth.guard';
import { Operation } from '../server/constants/db.enum';
import { operationGuard } from './core/guards/operation.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./main-panel/main-panel.component')
      .then(c => c.MainPanelComponent),
    canActivate: [authGuard],
    children: [
      {
        path: Pages.DASHBOARD,
        loadComponent: () => import('./main-panel/pages/dashboard/dashboard.component')
          .then(c => c.DashboardComponent),
      },
      {
        path: Pages.STATEMENTS,
        loadComponent: () => import('./main-panel/pages/transactions-list/transactions-list.component')
          .then(c => c.TransactionsListComponent),
      },
      {
        path: Pages.OPERATIONS,
        loadComponent: () => import('./main-panel/pages/transfer/transfer.component')
          .then(c => c.TransferComponent),
        children: [
          {
            path: Operation.PIX,
            loadComponent: () => import('./main-panel/pages/transfer/components/operation-form/operation-form.component')
              .then(c => c.OperationFormComponent),
            canActivate: [operationGuard]
          },
          {
            path: Operation.DEPOSITO,
            loadComponent: () => import('./main-panel/pages/transfer/components/operation-form/operation-form.component')
              .then(c => c.OperationFormComponent),
            canActivate: [operationGuard]
          },
          {
            path: Operation.SAQUE,
            loadComponent: () => import('./main-panel/pages/transfer/components/operation-form/operation-form.component')
              .then(c => c.OperationFormComponent),
            canActivate: [operationGuard]
          },
          {
            path: Operation.DEBITO,
            loadComponent: () => import('./main-panel/pages/transfer/components/operation-form/operation-form.component')
              .then(c => c.OperationFormComponent),
            canActivate: [operationGuard]
          },
          {
            path: Operation.PAGAMENTO,
            loadComponent: () => import('./main-panel/pages/transfer/components/operation-form/operation-form.component')
              .then(c => c.OperationFormComponent),
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
        loadComponent: () => import('./main-panel/pages/document-list/document-list.component')
          .then(c => c.DocumentListComponent),
      },
      {
        path: Pages.LOAN,
        loadComponent: () => import('./main-panel/pages/loan/loan.component')
          .then(c => c.LoanComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./main-panel/pages/loan/components/loan-resume/loan-resume.component')
              .then(c => c.LoanResumeComponent),
          },
          {
            path: 'simular',
            loadComponent: () => import('./main-panel/pages/loan/components/loan-form/loan-form.component')
              .then(c => c.LoanFormComponent),
          },
          {
            path: 'contratos',
            loadComponent: () => import('./main-panel/pages/loan/components/loan-list/loan-list.component')
              .then(c => c.LoanListComponent),
          },
          {
            path: 'contratos/:id',
            loadComponent: () => import('./main-panel/pages/loan/components/installments-table/installments-table.component')
              .then(c => c.InstallmentsTableComponent),
          }
        ]
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
    loadComponent: () => import('./login/login.component')
      .then(c => c.LoginComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.component')
      .then(c => c.NotFoundComponent),
  }
]