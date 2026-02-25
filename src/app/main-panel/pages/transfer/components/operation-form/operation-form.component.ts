import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { OperationService } from '../../services/operation.service';
import { Operation } from '../../../../../../server/constants/data.enum';
import { Observable } from 'rxjs';
import { ErrorsObj } from '../../models/operation.models';
import { LoginService } from '../../../../../core/login.services/login.service';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-operation-form',
  imports: [
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatRadioModule,
    BrCurrencyPipe,
    MatIconModule
],
  templateUrl: './operation-form.component.html',
  styleUrl: './operation-form.component.css'
})
export class OperationFormComponent {
  private operationService = inject(OperationService);
  private loginService = inject(LoginService);
  private _operationForm = this.operationService.operationForm;
  readonly isExpense: Observable<boolean> = this.operationService.isExpense;
  private inputFocado$ = signal<boolean>(false);
  errosDestino: ErrorsObj[] = [
    {key: 'destino', code: 'minlength'},
    {key: 'destino', code: 'userNotExist'},
    {key: 'destino', code: 'emailInvalido'},
    {key: 'destino', code: 'accountLogged'},
    {key: 'destino', code: 'required'}
  ];
  errorValor: ErrorsObj[] = [
    {key: 'valor', code: 'valueUperSaldo'},
    {key: 'valor', code: 'invalidValue'}
  ];

  ngOnInit(): void {
    this.operationService.buildForm(this.currentOp);
  }

  get userDestino() {
    return this.operationService.userDestino
  }

  get inputFocado() {
    return this.inputFocado$();
  }

  get saldo() {
    return this.loginService.user?.saldo;
  }

  set inputFocado(focus: boolean) {
    this.inputFocado$.set(focus);
  }

  get operationForm() {
    return this._operationForm;
  }

  get operation() {
    return Operation;
  }

  get tipoConta() {
    return this.operationService.tipoConta;
  }

  get operationItems() {
    return this.operationService.operationMenu;
  }

  get currentOp() {
    return this.operationService.currentOp;
  }

  get mensagemErro() {
    return this.operationService.errorsForm;
  }

  resetDestino() {
    this.operationForm.get('destino')?.setValue('');
  }


  checkError(errors: ErrorsObj[]) {
    errors.forEach(({key, code}) => {
      if (this.operationForm.get(key)?.hasError(code)) {
        this.operationService.updateErros(key, code);
      }
    })
  }

  formatar(event: Event) {
    const input = event.target as HTMLInputElement;
    let valor = input.value;

    // 1. Retira qualquer coisa que não for número
    valor = valor.replace(/[^0-9]/g, '');
    
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
    const formatado = this.formataValor(numero);

    // 7. Atualiza o FormControl e coloca o cursor à esquerda
    this.operationForm.get('valor')?.setValue(formatado);
    input.setSelectionRange(input.value.length, input.value.length);
    this.checkError(this.errorValor);
  }

  valorBlur() {
    this.inputFocado = false;
    this.checkError(this.errorValor);
  }

  formataValor(valor: number) {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  transfSaldoTotal(){
    if(this.operationForm.get('valor')?.value === '0,00') {
      const saldoString = this.formataValor(this.saldo!);
      this.operationForm.get('valor')?.setValue(saldoString);
    } else {
      this.operationForm.get('valor')?.setValue('0,00');
    }
  }

  submit(){
    if (this.currentOp.operation === Operation.PIX) {
      const form = this.operationForm.value;
      console.log(form);
    }
  }
}
