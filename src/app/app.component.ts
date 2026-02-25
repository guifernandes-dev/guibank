import { Component, inject, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MainPanelComponent } from "./main-panel/main-panel.component";
import { LoginComponent } from "./login/login.component";
import { User } from './core/models/services.model';
import { LoginService } from './core/login.services/login.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, SidebarComponent, MainPanelComponent, LoginComponent],
  providers: [CookieService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private loginService = inject(LoginService);

  get user(): User | null {
    return this.loginService.user;
  }

  ngOnInit() {
    this.loginService.searchUserLogged();
  }
}
