import { CookieService } from 'ngx-cookie-service';
import { inject, Injectable, signal } from '@angular/core';
import { APIService } from '../api.services/api.service';
import { catchError, first, map, Observable, of } from 'rxjs';
import { User } from '../models/services.model';
import { Login, AccountResp, Transaction } from '../../../server/models/db.model';
import { UtilService } from '../util.services/util.service';
import { Router } from '@angular/router';
import { Pages } from '../../constants/front.enum';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly api = inject(APIService);
  private readonly utils = inject(UtilService);
  private readonly translate = inject(TranslateService);
  private readonly cookies = inject(CookieService);
  private readonly router = inject(Router);
  private user$ = signal<User | null>(null);
  private userOperations$ = signal<Transaction[]>([]);
  readonly isLoading = signal(false);

  get user() {
    return this.user$;
  }

  get userOp() {
    return this.userOperations$;
  }

  findUserOp(): void {
    if(this.userOp.length) return;
    this.api
      .getTransactionsByUser(this.user()?.id!)
      .pipe(first())
      .subscribe({
        next: operations => {
          this.userOperations$.set(operations.map(op => ({
            ...op,
            data: new Date(op.data),
            vencimento: op.vencimento ? new Date(op.vencimento) : null,
          })));
        },
        error: () => {
          const message = this.translate.instant('LOGIN.SNACKS.FIND_OP');
          this.utils.openSnackBar(message);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
  }

  getToken(): string {
    return this.cookies.get('accountLogged');
  }

  guardLoggedUser(): Observable<boolean> {    
    if(this.user()) return of(true);
    const accessToken = this.getToken();
    
    if(!accessToken) return of(false);
    return this.api.getValidUser()
      .pipe(
        first(),
        map((user) => {
          this.isLoading.set(true);
          this.registrarUser({accessToken,user});
          return true;
        }),
        catchError(()=> {
          const message = this.translate.instant('LOGIN.SNACKS.FIND_OP');
          this.utils.openSnackBar(message);
          return of(false);
        })
      )
  }

  logar(login: Login) {
    this.api.postLogin(login)
      .pipe(first())
      .subscribe({
        next: resp => {
          this.registrarUser(resp);
          this.router.navigate([`/${Pages.DASHBOARD}`])
        },
        error: () => {
          const message = this.translate.instant('LOGIN.SNACKS.INCORRECT_USER');
          this.utils.openSnackBar(message);
        }
    });
  }

  logout() {
    this.cookies.delete('accountLogged');
    this.user$.set(null);
    this.userOperations$.set([]);
    this.router.navigate(['/login'])
  }

  criarConta(newWuser: Omit<User,'id'>) {
    this.api.postRegister(newWuser)
      .pipe(first())
      .subscribe({
        next: resp => {
          this.registrarUser(resp);
          this.router.navigate([`/${Pages.DASHBOARD}`])
        },
        error: () => {
          const message = this.translate.instant('LOGIN.SNACKS.EMAIL_EXIST');
          this.utils.openSnackBar(message);
        }
      });
  }

  registrarUser(account: AccountResp) {
    const {user, accessToken} = account;
    this.cookies.set(
      'accountLogged',
      accessToken,
      { expires: 2/24 }
    );
    this.user$.set(user);
  }
}
