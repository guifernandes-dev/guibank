import { Component, inject } from '@angular/core';
import { Pages } from '../constants/front.enum';
import { MenuItem } from '../core/models/services.model';
import {MatIconModule} from '@angular/material/icon';
import { RouterModule } from "@angular/router";
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { UtilService } from '../core/util.services/util.service';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule, RouterModule, TranslatePipe, MatButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly translate = inject(TranslateService);
  private readonly utils = inject(UtilService);
  readonly menuItems: MenuItem[] = [
    {
      label: 'SIDEBAR.DASHBOARD',
      icon: "dashboard",
      page: Pages.DASHBOARD,
    },
    {
      label: 'SIDEBAR.STATEMENTS',
      icon: "account_balance_wallet",
      page: Pages.STATEMENTS,
    },
    {
      label: 'SIDEBAR.DOCUMENTS',
      icon: "request_quote",
      page: Pages.DOCUMENTS,
    },
    {
      label: 'SIDEBAR.OPERATIONS',
      icon: "currency_exchange",
      page: Pages.OPERATIONS,
    },
    {
      label: 'SIDEBAR.LOAN',
      icon: "price_check",
      page: Pages.LOAN,
    }
  ];

  setPt() {
    const lang = 'pt-BR';
    this.translate.use(lang);    
    this.utils.setLangAtual(lang);
  }

  setUs() {
    const lang = 'en-US';
    this.translate.use(lang);
    this.utils.setLangAtual(lang);
  }
}
