
import { CookieService } from 'ngx-cookie-service';
import { inject, Injectable } from '@angular/core';
import { APIService } from '../api.services/api.service';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { User } from '../models/services.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private user$ = new BehaviorSubject<User | null>(null);
  private snackBar = inject(MatSnackBar);
  private apiService = inject(APIService);
  private cookieService = inject(CookieService);
  readonly duration = 4000;

  // todayLocale = new Date().toLocaleDateString().split('/');
  // todayISO = `${this.todayLocale[2]}-${this.todayLocale[1]}-${this.todayLocale[0]}`


  get user(): Observable<User | null> {
    return this.user$;
  }

  searchUserLogged() {
    this.user.subscribe(user => {
      if(!user) {
        this.user$.next(JSON.parse(this.cookieService.get('user')))
      }
    })
  }

  logar(email: string, senha: string) {
    this.apiService
      .getUserByEmailESenha(email,senha)
      .pipe(first())
      .subscribe(user => {
        if (user.length) {
          const userFind: User = {
            conta: user[0].id,
            nome: user[0].nome,
            email: user[0].email
          }
          this.registrarUser(userFind);
        } else {
          this.snackBar.open(
            'E-mail ou senha incorreto.','Fechar',
            { duration: this.duration, panelClass: 'snackbar-erro'}
          );
          this.user$.next(null);
        }
      })
  }

  logout() {
    this.cookieService.delete('user');
    this.user$.next(null);
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
            .subscribe(({nome,email,id}) => {
              const user: User = {
                nome,
                email,
                conta: id
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
    this.user$.next(user);
  }
}
