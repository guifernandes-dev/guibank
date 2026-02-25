
import { CookieService } from 'ngx-cookie-service';
import { inject, Injectable, signal } from '@angular/core';
import { APIService } from '../api.services/api.service';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { User } from '../models/services.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private user$ = signal<User | null>(null);
  private snackBar = inject(MatSnackBar);
  private apiService = inject(APIService);
  private cookieService = inject(CookieService);
  readonly duration = 4000;

  // todayLocale = new Date().toLocaleDateString().split('/');
  // todayISO = `${this.todayLocale[2]}-${this.todayLocale[1]}-${this.todayLocale[0]}`


  get user(): User | null {
    return this.user$();
  }

  searchUserLogged() {
    if(!this.user) {
      this.user$.set(JSON.parse(this.cookieService.get('user')))
    }
  }

  logar(email: string, senha: string) {
    this.apiService
      .getUserByEmailESenha(email,senha)
      .pipe(first())
      .subscribe(users => {
        if (users.length) {
          const {id, nome, saldo, email} = users[0];
          const userFind: User = {
            conta: id,
            nome,
            saldo,
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
  }

  criarConta(newWuser: User) {
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
            .subscribe(({nome,email,id,saldo}) => {
              const user: User = {
                nome,
                email,
                conta: id,
                saldo
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
  }
}
