import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../login.services/login.service';
import { finalize, first, map } from 'rxjs';
import { Pages } from '../../constants/front.enum';
import { LoanService } from '../../main-panel/pages/loan/services/loan.service';
import { isPlatformServer } from '@angular/common';

export const authGuard: CanActivateFn = (_, state) => {
  const platform = inject(PLATFORM_ID);
  const loginService = inject(LoginService);
  const loanService = inject(LoanService);
  const router = inject(Router);

  if(isPlatformServer(platform)) {
    loginService.isLoading.set(true);    
    return true;
  }

  if(state.url === '/login') {
    return loginService.guardLoggedUser()
      .pipe(
        first(),
        map(isLogged => {
          if(isLogged) return router.createUrlTree([`/${Pages.DASHBOARD}`]);
          return true;
        }),
        finalize(()=>{
          loginService.isLoading.set(false);
        })
      );
  } else {
    return loginService.guardLoggedUser()
      .pipe(
        first(),
        map(isLogged => {
          console.log(platform);
          console.log('aqyu');
          
          if(!isLogged) return router.createUrlTree(['/login']);
          loginService.findUserOp();
          const {id} = loginService.user()!;
          loanService.getUserLoans(id);
          return true;
        }),
        finalize(()=>{
          loginService.isLoading.set(false);
        })
      );
  }
};
