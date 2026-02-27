
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
  private user$ = signal<User | null>(null);
  private userOperations$ = signal<Transaction[]>([]);
  private snackBar = inject(MatSnackBar);
  private apiService = inject(APIService);
  private cookieService = inject(CookieService);
  private readonly duration = 4000;

  get user(): User | null {
    return this.user$();
  }

  get userOp() {
    return this.userOperations$;
  }

  setUserOp(): void {
    if(this.userOp.length) return;
    this.apiService
      .getTransactionsByUserOrigin(this.user?.conta!)
      .pipe(first())
      .subscribe(operations => {
        this.userOperations$.set([...this.userOperations$(),...operations]);
        this.apiService
          .getTransactionsByUserDestination(this.user?.conta!)
          .pipe(first())
          .subscribe(operations => {
            this.userOperations$.set([...this.userOperations$(),...operations]);
          });
      });
  }

  searchUserLogged() {
    if(!this.user) {
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

  formataValorInput (event: Event): string {
    const input = event.target as HTMLInputElement;
    const text = input.value;
    // 1. Retira qualquer coisa que não for número
    let valor = text.replace(/[^0-9]/g, '');
    
    // 2. verifica se estou apagando
    if (input.value.length === valor.length+1) {
      //2.1. adiciona o zero à esquerda
      valor = '0' + valor
    // 3. verifica se há zero à esquerda e se o botão apertado pelo usuário é um número
    } else if(valor[0] === '0' && input.value.length-2 !== valor.length) {
      // 3.1. remove o primeiro zero à esquerda
      valor = valor.substring(1);
    }
    // 4. Adiciona o "." após os dois últimos dígitos
    valor = valor.slice(0, -2) + '.' + valor.slice(-2);
    
    // 5. transforma a string em number
    let numero = parseFloat(valor);
    if (isNaN(numero)) {
      numero = 0;
    }

    // 6. Formata no padrão brasileiro: #.###,##
    return this.formataValor(numero);
  }

  formataValor (valor: number): string {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formataValorNumero(valor: string): number {
    return parseFloat(valor.replace('.','').replace(',','.'))
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
