import { CookieService } from 'ngx-cookie-service';
import { inject, Injectable, signal } from '@angular/core';
import { APIService } from '../api.services/api.service';
import { first } from 'rxjs';
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
  private readonly apiService = inject(APIService);
  private readonly utilService = inject(UtilService);
  private readonly cookieService = inject(CookieService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private user$ = signal<User | null>(null);
  private userOperations$ = signal<Transaction[]>([]);

  get user() {
    return this.user$;
  }

  get userOp() {
    return this.userOperations$;
  }

  setUserOp(): void {
    if(this.userOp.length) return;
    this.apiService
      .getTransactionsByUser(this.user()?.conta!)
      .pipe(first())
      .subscribe(operations => {
        this.userOperations$.set(operations.map(op => ({
          ...op,
          data: new Date(op.data),
          vencimento: op.vencimento ? new Date(op.vencimento) : null,
        })));
      });
  }

  searchUserLogged(
    accountCookie: string = this.cookieService.get('accountLogged'),
    route: string =''
  ) {
    if(!this.user()) {
      const accountLogged = JSON.parse(accountCookie)
      this.apiService.getUserByAccount(accountLogged)
        .pipe(first())
        .subscribe({
          next: user => {
            this.setUser(user, 'Conta não encontrada', route);
            this.setUserOp();
          },
          error: err => {
            console.error(err);
          }
        })
    }
  }

  setUser = (users: Account[], errorMessage: string = '', route: string ='') => {
    if (users.length) {
      const {id, nome, renda, email} = users[0];
      const userFind: User = {
        conta: id,
        nome,
        renda,
        email
      }
      this.registrarUser(userFind);
      if (route) {
        this.router.navigate([`/${Pages.DASHBOARD}`]);
      }
    } else {
      this.snackBar.open(
        errorMessage,'Fechar',
        {
          duration: this.utilService.duration,
          panelClass: 'snackbar-erro'
        }
      );
      this.user$.set(null);
      if (!route) {
        this.router.navigate(['/login']);
      }
    }
  }

  logar(email: string, senha: string) {
    this.apiService
      .getUserByEmailESenha(email,senha)
      .pipe(first())
      .subscribe(users => {
        this.setUser(users, 'Usuário ou E-mail incorreto.', 'login');
      })
  }

  logout() {
    this.cookieService.delete('accountLogged');
    this.user$.set(null);
    this.userOperations$.set([]);
    this.router.navigate(['/login'])
  }

  criarConta(newWuser: Omit<User,'conta'>) {
    this.apiService
      .getUserByEmail(newWuser.email)
      .pipe(first())
      .subscribe(user => {
        if(user.length) {
          this.snackBar.open(
            'E-mail já cadastrado',
            'Ok',
            {
              duration: this.utilService.duration,
              panelClass: 'snackbar-erro'
            }
          );
        } else {
          this.apiService.postUser(newWuser)
            .pipe(first())
            .subscribe(({nome,email,id,renda}) => {
              const user: User = {
                nome,
                email,
                conta: id,
                renda
              };
              this.registrarUser(user);
              this.router.navigate([`/${Pages.DASHBOARD}`])
            });
        }
      });
  }

  registrarUser(user: User) {
    this.cookieService.set(
      'accountLogged',
      JSON.stringify(user.conta),
      { expires: 2 }
    );
    this.user$.set(user);
    this.setUserOp();
  }
}
