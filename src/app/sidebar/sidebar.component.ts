import { Component, inject } from '@angular/core';
import { Pages } from '../constants/pages.enum';
import { MenuItem } from '../core/models/services.model';
import { RouterService } from '../core/router.services/router.service';
import { first } from 'rxjs';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private routerService = inject(RouterService);
  menuItems$: MenuItem[] = this.routerService.menuItem;

  disabledBtn(pageIterr: string): boolean {
    let disabled = false;
    this.routerService.currentPage
      .pipe(first())
      .subscribe(page => {
        if (page === pageIterr) {
          disabled = true
        };
      });
    return disabled;
  }

  redirectToPage(page: Pages): void {
    this.routerService.currentPage = page;
  }
}
