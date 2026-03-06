import { Component, inject } from '@angular/core';
import { Pages } from '../constants/front.enum';
import { MenuItem } from '../core/models/services.model';
import {MatIconModule} from '@angular/material/icon';
import { Router, RouterModule } from "@angular/router";

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly router = inject(Router);
  readonly menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: "dashboard",
      page: Pages.DASHBOARD,
    },
    {
      label: "Extrato",
      icon: "account_balance_wallet",
      page: Pages.STATEMENTS,
    },
    {
      label: "Documentos",
      icon: "request_quote",
      page: Pages.DOCUMENTS,
    },
    {
      label: "Operações",
      icon: "currency_exchange",
      page: Pages.OPERATIONS,
    },
    {
      label: "Empréstimos",
      icon: "price_check",
      page: Pages.LOAN,
    }
  ];
}
