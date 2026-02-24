import { Component, inject, OnInit } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { LoginService } from '../core/login.services/login.service';
import { User } from '../core/models/services.model';
import { first } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule,MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  private loginService = inject(LoginService);
  private user$ = this.loginService.user;
  user!: User

  ngOnInit(): void {
    this.user$
      .pipe(first())
      .subscribe(user =>{
        if(user) {
          this.user = user;
        }
      })
  }

  logout() {
    this.loginService.logout()
  }
}
