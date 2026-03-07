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
import { LoanResumeComponent } from './main-panel/pages/loan/components/loan-resume/loan-resume.component';
import { LoanFormComponent } from './main-panel/pages/loan/components/loan-form/loan-form.component';
import { LoanListComponent } from './main-panel/pages/loan/components/loan-list/loan-list.component';
import { InstallmentsTableComponent } from './main-panel/pages/loan/components/installments-table/installments-table.component';

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
            component: InstallmentsTableComponent,
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
    component: LoginComponent,
    loadComponent: () => import('./login/login.component')
      .then(c => c.LoginComponent),
    canActivate: [loginGuard] },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.component')
      .then(c => c.NotFoundComponent),
  }
]