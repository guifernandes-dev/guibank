import { CookieService } from 'ngx-cookie-service';
import { inject, Injectable, signal } from '@angular/core';
import { APIService } from '../api.services/api.service';
import { catchError, first, map, Observable, of } from 'rxjs';
import { User } from '../models/services.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Account, Transaction } from '../../../server/models/db.model';
import { UtilService } from '../util.services/util.service';
import { Router } from '@angular/router';
import { Pages } from '../../constants/front.enum';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly api = inject(APIService);
  private readonly utils = inject(UtilService);
  private readonly cookies = inject(CookieService);
  private readonly router = inject(Router);
  private user$ = signal<User | null>(null);
  private userOperations$ = signal<Transaction[]>([]);

  get user() {
    return this.user$;
  }

  get userOp() {
    return this.userOperations$;
  }

  findUserOp(): void {
    if(this.userOp.length) return;
    console.log(this.user());
    this.api
      .getTransactionsByUser(this.user()?.conta!)
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
          this.utils.openSnackBar('Erro ao buscar as operações!')
        }
      });
  }

  guardLoggedUser(): Observable<boolean> {
    if(this.user()) return of(true);
    const accountCookie: string | null = JSON.parse(
      this.cookies.get('accountLogged') || 'null'
    );
    if(!accountCookie) return of(false);
    return this.api.getUserByAccount(accountCookie)
      .pipe(
        first(),
        map(users => {
          if(!users.length) {
            this.utils.openSnackBar('Usuário não encotrado');
            return false;
          };
          this.registrarUser(users);
          return true;
        }),
        catchError(()=> {
          this.utils.openSnackBar('Erro ao buscar o usuário, tente novamente mais tarde.')
          return of(false);
        })
      )
  }

  logar(email: string, senha: string) {
    this.api
      .getUserByEmailESenha(email,senha)
      .pipe(first())
      .subscribe(users => {
        if(!users.length) {
          this.utils.openSnackBar('Usuário ou E-mail incorreto.');
          return;
        }
        this.registrarUser(users);
        this.router.navigate([`/${Pages.DASHBOARD}`])
      })
  }

  logout() {
    this.cookies.delete('accountLogged');
    this.user$.set(null);
    this.userOperations$.set([]);
    this.router.navigate(['/login'])
  }

  criarConta(newWuser: Omit<User,'conta'>) {
    this.api
      .getUserByEmail(newWuser.email)
      .pipe(first())
      .subscribe(user => {
        if(user.length) {
          this.utils.openSnackBar('E-mail já cadastrado','Ok');
        } else {
          this.api.postUser(newWuser)
            .pipe(first())
            .subscribe((account) => {
              this.registrarUser([account]);
              this.router.navigate([`/${Pages.DASHBOARD}`])
            });
        }
      });
  }

  registrarUser(users: Account[]) {
    const {id, nome, renda, email} = users[0];
      const user: User = {
        conta: id,
        nome,
        renda,
        email
      }
    this.cookies.set(
      'accountLogged',
      JSON.stringify(user.conta),
      { expires: 2 }
    );
    this.user$.set(user);
  }
}
