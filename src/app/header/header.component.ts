import { Component, inject } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { LoginService } from '../core/login.services/login.service';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule,MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private loginService = inject(LoginService);

  get user() {
    return this.loginService.user
  }

  logout() {
    this.loginService.logout()
  }
}
