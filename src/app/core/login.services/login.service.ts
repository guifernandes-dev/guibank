import { CookieService } from 'ngx-cookie-service';
import { inject, Injectable, signal } from '@angular/core';
import { APIService } from '../api.services/api.service';
import { first } from 'rxjs';
import { User } from '../models/services.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Transaction } from '../../../server/models/db.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly apiService = inject(APIService);
  private cookieService = inject(CookieService);
  private snackBar = inject(MatSnackBar);
  private user$ = signal<User | null>(null);
  private userOperations$ = signal<Transaction[]>([]);
  private readonly duration = 4000;

  get user() {
    return this.user$;
  }

  get userOp() {
    return this.userOperations$;
  }

  setUserOp(): void {
    if(this.userOp.length) return;
    this.apiService
      .getTransactionsByUserOrigin(this.user()?.conta!)
      .pipe(first())
      .subscribe(operations => {
        this.userOperations$.set([...this.userOperations$(),...operations]);
        this.apiService
          .getTransactionsByUserDestination(this.user()?.conta!)
          .pipe(first())
          .subscribe(operations => {
            this.userOperations$.set([...this.userOperations$(),...operations]);
          });
      });
  }

  searchUserLogged() {
    if(!this.user()) {
      const userCookie: string = this.cookieService.get('user');
      if(userCookie) {
        this.user$.set(JSON.parse(userCookie));
        this.setUserOp();
      }
    }
  }

  logar(email: string, senha: string) {
    this.apiService
      .getUserByEmailESenha(email,senha)
      .pipe(first())
      .subscribe(users => {
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
            'E-mail ou senha incorreto.','Fechar',
            { duration: this.duration, panelClass: 'snackbar-erro'}
          );
          this.user$.set(null);
        }
      })
  }

  logout() {
    this.cookieService.delete('user');
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
            { duration: this.duration, panelClass: 'snackbar-erro'}
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
      'user',
      JSON.stringify(user),
      { expires: 2 }
    );
    this.user$.set(user);
    this.setUserOp();
  }
}
