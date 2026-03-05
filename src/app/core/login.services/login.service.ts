import { CookieService } from 'ngx-cookie-service';
import { inject, Injectable, signal } from '@angular/core';
import { APIService } from '../api.services/api.service';
import { first } from 'rxjs';
import { User } from '../models/services.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Account, Transaction } from '../../../server/models/db.model';
import { UtilService } from '../util.services/util.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly apiService = inject(APIService);
  private cookieService = inject(CookieService);
  private utilService = inject(UtilService);
  private snackBar = inject(MatSnackBar);
  private user$ = signal<User | null>(null);
  private userOperations$ = signal<Transaction[]>([]);
  private loadingUser$ = signal<boolean>(true);

  get user() {
    return this.user$;
  }

  get userOp() {
    return this.userOperations$;
  }

  get loadingUser() {
    return this.loadingUser$;
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

  searchUserLogged() {
    if(!this.user()) {
      const accountCookie: string = this.cookieService.get('accountLogged');
      if(accountCookie) {
        const accountLogged = JSON.parse(accountCookie)
        this.apiService.getUserByAccount(accountLogged)
          .pipe(first())
          .subscribe({
            next: user => {
              this.setUser(user, 'Conta não encontrada');
              this.setUserOp();
            },
            complete: () => {
              this.loadingUser$.set(false);
            }
          })
      } else {
        this.loadingUser$.set(false);
      }
    }
  }

  setUser = (users: Account[], errorMessage: string = '') => {
    if (users.length) {
      const {id, nome, renda, email} = users[0];
      const userFind: User = {
        conta: id,
        nome,
        renda,
        email
      }
      this.registrarUser(userFind);
    } else {
      this.snackBar.open(
        errorMessage,'Fechar',
        {
          duration: this.utilService.duration,
          panelClass: 'snackbar-erro'
        }
      );
      this.user$.set(null);
    }
  }

  logar(email: string, senha: string) {
    this.apiService
      .getUserByEmailESenha(email,senha)
      .pipe(first())
      .subscribe(users => {
        this.setUser(users, 'Usuário ou E-mail incorreto.')
      })
  }

  logout() {
    this.cookieService.delete('accountLogged');
    this.user$.set(null);
    this.userOperations$.set([]);
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
