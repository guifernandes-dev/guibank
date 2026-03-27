import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from '../core/login.services/login.service';
import { LoadingComponent } from "../shared/loading/loading.component";

@Component({
  selector: 'app-main-panel',
  standalone: true,
  imports: [RouterModule, SidebarComponent, HeaderComponent, MatSidenavModule, MatIconModule, MatButtonModule, LoadingComponent],
  templateUrl: './main-panel.component.html',
  styleUrl: './main-panel.component.css'
})
export class MainPanelComponent {
  private readonly login = inject(LoginService);
  opened: boolean = false;

  get isLoading() {
    return this.login.isLoading;
  }
}
