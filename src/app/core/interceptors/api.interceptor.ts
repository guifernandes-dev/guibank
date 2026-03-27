import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { LoginService } from "../login.services/login.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  const userLogged = loginService.getToken();

  if (!userLogged) return next(req);

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${userLogged}`
    }
  });
  return next(authReq);
};