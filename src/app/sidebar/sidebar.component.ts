import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Pages } from '../constants/pages.enum';
import { MenuItem } from '../models/services.model';
import { RouterService } from '../core/router.services/router.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [AsyncPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private routerService = inject(RouterService);
  menuItems$: Observable<MenuItem[]> = this.routerService.menuItem;

  redirectToPage(page: Pages): void {
    this.routerService.currentPage = page;
  }
}
