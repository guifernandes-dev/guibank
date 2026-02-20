import { Component, inject, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MainPanelComponent } from "./main-panel/main-panel.component";
import { LoginComponent } from "./login/login.component";
import { User } from './models/services.model';
import { LoginService } from './core/login.services/login.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, SidebarComponent, MainPanelComponent, LoginComponent, AsyncPipe],
  providers: [CookieService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private loginService = inject(LoginService);
  private user$ = this.loginService.user;

  get user(): Observable<User | null> {
    return this.user$;
  }

  ngOnInit() {
    this.loginService.searchUserLogged();
  }
}
