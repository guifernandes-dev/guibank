import { Component, inject, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MainPanelComponent } from "./main-panel/main-panel.component";
import { LoginComponent } from "./login/login.component";
import { LoginService } from './core/login.services/login.service';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, SidebarComponent, MainPanelComponent, LoginComponent],
  providers: [CookieService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private loginService = inject(LoginService);

  get user() {
    return this.loginService.user;
  }

  get loadingUser() {
    return this.loginService.loadingUser;
  }

  ngOnInit() {
    this.loginService.searchUserLogged();
  }
}
