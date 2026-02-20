import { EventEmitter, Injectable } from '@angular/core';
import { Pages } from '../../constants/pages.enum';
import { MenuItem } from '../../models/services.model';
import { BehaviorSubject, first, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouterService {
  private currentPage$ = new BehaviorSubject<Pages>(Pages.DASHBOARD);
  private menuItems$ = new BehaviorSubject<MenuItem[]>([
    {
      label: "Dashboard",
      selected: true,
      icon: "",
      page: Pages.DASHBOARD,
    },
    {
      label: "Extrato",
      selected: false,
      icon: "",
      page: Pages.TRANSACTION,
    },
    {
      label: "Transferência",
      selected: false,
      icon: "",
      page: Pages.TRANSFER,
    },
    {
      label: "Crédito",
      selected: false,
      icon: "",
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
    this.menuItems$
      .pipe(first())
      .subscribe(menuItems => {
        this.menuItems$.next(menuItems.map(item => {
          if(arrayPages.includes(item.page)) {
            return {
              ...item,
              selected: !item.selected
            }
          }
          return item
        }));
      })
  }
}
