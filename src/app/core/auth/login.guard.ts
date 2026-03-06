import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { LoginService } from '../login.services/login.service';
import { CookieService } from 'ngx-cookie-service';

export const loginGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const cookieService = inject(CookieService);
  const accountCookie = cookieService.get('accountLogged');
  
  if(accountCookie) {
    loginService.searchUserLogged(accountCookie, 'login');
    return false;
  }
  return true;
};
