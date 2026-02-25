import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge, Observable } from 'rxjs';
import {FormControl, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from "@angular/material/icon";
import { LoginService } from '../core/login.services/login.service';
import { User } from '../core/models/services.model';

@Component({
  selector: 'app-login',
  imports: [MatButtonModule, MatInputModule, MatIcon, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private loginService = inject(LoginService);
  private _loginForm = signal(true);
  user$: Observable<User | null> = this.loginService.user;
  readonly nome = new FormControl('', [Validators.required, Validators.minLength(3)]);
  readonly email = new FormControl('', [Validators.required, Validators.email]);
  readonly senha = new FormControl('', [Validators.required, this.passwordStrengthValidator()]);
  emailError = signal('');
  nomeError = signal('');
  senhaChecks = signal({
    hasMinLength: false,
    hasLetter: false,
    hasNumber: false,
    hasSpecial: false
  });
  hide = signal(true);

  constructor() {
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateEmailError());
    merge(this.senha.statusChanges, this.senha.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateSenhaChecks());
  }

  get loginForm() {
    return this._loginForm()
  }

  toogleLoginForm(): void {
    this._loginForm.set(!this._loginForm());
  }

  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value ?? '';

      const hasMinLength = value.length >= 4 && value.length <= 8;
      const hasLetter = /[A-Za-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecial = /[^A-Za-z0-9]/.test(value);

      const valid = hasMinLength && hasLetter && hasNumber && hasSpecial;    

      return valid
        ? null
        : {
          passwordStrength: {
            hasMinLength,
            hasLetter,
            hasNumber,
            hasSpecial
          }
        };
    }
  }

  changeHide(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  updateEmailError() {
    if (this.email.hasError('required')) {
      this.emailError.set('insira um e-mail');
    } else if (this.email.hasError('email')) {
      this.emailError.set('e-mail inválido');
    } else {
      this.emailError.set('');
    }
  }

  updateNomeError() {
    if(this.loginForm) {
      this.nomeError.set('');
    } else if(this.nome.hasError('required')) {
      this.nomeError.set('insira um nome');
    } else if (this.nome.hasError('minlenght')) {
      this.nomeError.set('o nome precisa de pelo menos 3 caracteres');
    } else {
      this.nomeError.set('');
    }
  }

  updateSenhaChecks() {
    const errors = this.senha.errors?.['passwordStrength'];

    if (!errors) {
      this.senhaChecks.set({
        hasMinLength: true,
        hasLetter: true,
        hasNumber: true,
        hasSpecial: true
      });
      return;
    }
    
    this.senhaChecks.set({
      hasMinLength: errors.hasMinLength,
      hasLetter: errors.hasLetter,
      hasNumber: errors.hasNumber,
      hasSpecial: errors.hasSpecial
    });
  }

  formValido(): boolean {
    const senhas = this.senhaChecks();
    const senhaValida = senhas.hasMinLength && senhas.hasLetter && senhas.hasNumber && senhas.hasSpecial;
    const nomeValido = this.loginForm || this.nome.valid;
    return !(senhaValida && nomeValido && this.email.valid);
    
  }

  submit() {
    const email = this.email.value;
    const senha = this.senha.value;
    if (this.loginForm) {
      if ( email && senha) {
        this.loginService.logar(email,senha);
      }
    } else {
      const nome = this.nome.value;
      if (nome && email && senha) {
        this.loginService.criarConta({nome,email,senha});
      }
    }
  }
}
