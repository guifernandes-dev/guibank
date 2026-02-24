import { EventEmitter, Injectable } from '@angular/core';
import { Pages } from '../../constants/pages.enum';
import { MenuItem } from '../models/services.model';
import { BehaviorSubject, first, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouterService {
  private currentPage$ = new BehaviorSubject<Pages>(Pages.OPERATIONS);
  private menuItems$ = new BehaviorSubject<MenuItem[]>([
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
      label: "Operações",
      icon: "currency_exchange",
      page: Pages.OPERATIONS,
    },
    {
      label: "Crédito",
      icon: "price_check",
      page: Pages.CREDIT,
    }
  ]);

  get currentPage(): Observable<Pages> {
    return this.currentPage$;
  }

  get menuItem(): Observable<MenuItem[]> {
    return this.menuItems$
  }

  set currentPage(page: Pages) {
    const arrayPages = [page]
    this.currentPage$
      .pipe(first())
      .subscribe(page => {
        arrayPages.push(page);
      })
    this.currentPage$.next(page);
  }
}
