import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../login.services/login.service';
import { CookieService } from 'ngx-cookie-service';

export const authGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const cookieService = inject(CookieService);
  const router = inject(Router);
  const accountCookie = cookieService.get('accountLogged');

  if(accountCookie) {
    loginService.searchUserLogged(accountCookie);
    return true;
  }
  router.navigate(['/login']);
  return false;
};
