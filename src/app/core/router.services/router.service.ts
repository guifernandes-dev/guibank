import { Injectable } from '@angular/core';
import { Pages } from '../../constants/pages.enum';
import { MenuItem } from '../models/services.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouterService {
  private currentPage$ = new BehaviorSubject<Pages>(Pages.DASHBOARD);
  private _menuItems: MenuItem[] = [
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

  get currentPage(): Observable<Pages> {
    return this.currentPage$;
  }

  get menuItem(): MenuItem[] {
    return this._menuItems;
  }

  set currentPage(page: Pages) {
    this.currentPage$.next(page);
  }
}
