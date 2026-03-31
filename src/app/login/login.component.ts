import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import {FormControl, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from "@angular/material/icon";
import { LoginService } from '../core/login.services/login.service';
import { UtilService } from '../core/util.services/util.service';
import { Login } from '../../server/models/db.model';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LoadingComponent } from "../shared/loading/loading.component";

@Component({
  selector: 'app-login',
  imports: [MatButtonModule, MatInputModule, MatIcon, MatFormFieldModule, FormsModule, ReactiveFormsModule, MatSnackBarModule, TranslatePipe, LoadingComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly loginService = inject(LoginService);
  private readonly utilService = inject(UtilService);
  private readonly translate = inject(TranslateService);
  private _loginForm = signal(true);
  readonly nome = new FormControl('', [Validators.required, Validators.minLength(3)]);
  readonly email = new FormControl('', [Validators.required, Validators.email]);
  readonly password = new FormControl('', [Validators.required, this.passwordStrengthValidator()]);
  readonly renda = new FormControl('0,00');
  emailError = signal('');
  nomeError = signal('');
  rendaError = signal('');
  passwordChecks = signal({
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
    merge(this.password.statusChanges, this.password.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updatePasswordChecks());
  }

  get loginForm() {
    return this._loginForm()
  }

  get isLoading() {
    return this.loginService.isLoading;
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
      this.emailError.set('LOGIN.EMAIL.ERROR.REQUIRED');
    } else if (this.email.hasError('email')) {
      this.emailError.set('LOGIN.EMAIL.ERROR.INVALID');
    } else {
      this.emailError.set('');
    }
  }

  updateNomeError() {
    console.log(this.nome.errors);
    
    if(this.loginForm) {
      this.nomeError.set('');
    } else if(this.nome.hasError('required')) {
      this.nomeError.set('LOGIN.NAME.ERROR.REQUIRED');
    } else if (this.nome.hasError('minlength')) {
      this.nomeError.set('LOGIN.NAME.ERROR.MINLENGTH');
    } else {
      this.nomeError.set('');
    }
  }

  updatePasswordChecks() {
    const errors = this.password.errors?.['passwordStrength'];

    if (!errors) {
      this.passwordChecks.set({
        hasMinLength: true,
        hasLetter: true,
        hasNumber: true,
        hasSpecial: true
      });
      return;
    }
    
    this.passwordChecks.set({
      hasMinLength: errors.hasMinLength,
      hasLetter: errors.hasLetter,
      hasNumber: errors.hasNumber,
      hasSpecial: errors.hasSpecial
    });
  }

  formatar(event: Event) {
    const formatado = this.utilService.formataValorInput(event);
    const value = this.utilService.formataValorNumero(formatado);
    this.renda.setValue(formatado);
    if(value < 40000) {
      this.renda.setErrors({ minlength: true });
      this.rendaError.set('LOGIN.INCOME.ERROR');
    }
    this.cursorend(event,formatado)
  }

  cursorend(event: Event, value?: string) {
    this.utilService.cursorend(event, value);
  }

  formValido(): boolean {
    const passwords = this.passwordChecks();
    const passwordValida = passwords.hasMinLength && passwords.hasLetter && passwords.hasNumber && passwords.hasSpecial;
    const nomeValido = this.loginForm || this.nome.valid;
    const rendaValida = this.loginForm || this.renda.valid;
    return !(passwordValida && nomeValido && this.email.valid && rendaValida);    
  }

  submit() {
    const email = this.email.value;
    const password = this.password.value;
    if (this.loginForm) {
      if ( email && password) {
        const user: Login = {
          email,
          password: password
        }
        this.loginService.logar(user);
      }
    } else {
      const nome = this.nome.value;
      const renda = this.utilService.formataValorNumero(this.renda.value!);
      if (nome && email && password) {
        this.loginService.criarConta({nome,email,password,renda});
      }
    }
  }

  setPt() {
    this.translate.use('pt-BR');
  }

  setUs() {
    this.translate.use('en-US');
  }
}
