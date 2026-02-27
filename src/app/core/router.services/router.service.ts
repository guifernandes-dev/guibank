import { inject, Injectable, signal } from '@angular/core';
import { Pages } from '../../constants/pages.enum';
import { MenuItem } from '../models/services.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { LoginService } from '../login.services/login.service';

@Injectable({
  providedIn: 'root'
})
export class RouterService {
  private readonly loginService = inject(LoginService);
  currentPage$ = signal<Pages>(Pages.DASHBOARD);
  historyNav$ = signal<Pages[]>([]);
  private readonly _menuItems: MenuItem[] = [
    {
      label: "Home",
      icon: "home",
      page: Pages.DASHBOARD,
    },
    {
      label: "Extrato",
      icon: "account_balance_wallet",
      page: Pages.STATEMENTS,
    },
    {
      label: "Boletos",
      icon: "request_quote",
      page: Pages.DOCUMENTS,
    },
    {
      label: "Operações",
      icon: "currency_exchange",
      page: Pages.OPERATIONS,
    },
    {
      label: "Crédito",
      icon: "price_check",
      page: Pages.CREDIT,
    }
  ];

  get menuItem(): MenuItem[] {
    return this._menuItems;
  }

  removeLastPage() {
    this.historyNav$.update(pages => {
      this.setStorage(pages[pages.length-1])
      return pages.slice(0,-1);
    });
  }

  setNavigate(page: Pages) {
    this.historyNav$.update(pages => ([...pages, this.currentPage$()]));
    this.setStorage(page);
  }

  getStorage() {
    const storagePages = localStorage.getItem('lastpage')
    if (storagePages) {
      const {conta} = this.loginService.user()!;
      const pages = JSON.parse(storagePages);
      const userLastPage = pages[conta]
      if(userLastPage) {
        this.currentPage$.set(userLastPage);
      }
    }
  }

  setStorage(page: Pages) {
    const storagePages = localStorage.getItem('lastpage');
    let storageObj;
    if(storagePages) {
      storageObj = JSON.parse(storagePages);
    } else {
      storageObj = {};
    }
    localStorage.setItem(
      'lastpage',
      JSON.stringify({...storageObj, [this.loginService.user()?.conta!]: page}),
    );
  }
}
