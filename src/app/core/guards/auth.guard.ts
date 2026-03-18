import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../login.services/login.service';
import { first, map } from 'rxjs';
import { Pages } from '../../constants/front.enum';

export const authGuard: CanActivateFn = (_, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if(state.url === '/login') {
    return loginService.guardLoggedUser()
      .pipe(
        first(),
        map(isLogged => {
          if(isLogged) return router.createUrlTree([`/${Pages.DASHBOARD}`]);
          return true;
        })
      );
  } else {
    return loginService.guardLoggedUser()
      .pipe(
        first(),
        map(isLogged => {
          if(!isLogged) return router.createUrlTree(['/login']);
          loginService.findUserOp();
          return true;
        })
      );
  }
};
