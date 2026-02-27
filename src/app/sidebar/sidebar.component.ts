import { Component, inject, OnInit } from '@angular/core';
import { Pages } from '../constants/pages.enum';
import { MenuItem } from '../core/models/services.model';
import { RouterService } from '../core/router.services/router.service';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  private readonly routerService = inject(RouterService);
  menuItems$: MenuItem[] = this.routerService.menuItem;

  ngOnInit(): void {
    this.routerService.getStorage();
  }

  get historyNav() {
    return this.routerService.historyNav$;
  }

  get currentPage() {
    return this.routerService.currentPage$;
  }

  backPage() {
    const pages = this.historyNav();
    this.currentPage.set(pages[pages.length-1]);
    this.routerService.removeLastPage();
  }

  redirectToPage(page: Pages): void {
    this.routerService.setNavigate(page);
    this.currentPage.set(page);
    console.log(this.historyNav());
  }
}
