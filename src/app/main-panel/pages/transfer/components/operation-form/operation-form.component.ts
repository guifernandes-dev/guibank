import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { OperationService } from '../../services/operation.service';
import { Operation } from '../../../../../../server/constants/data.enum';
import { Observable } from 'rxjs';
import { ErrorsForm } from '../../models/operation.models';
import { LoginService } from '../../../../../core/login.services/login.service';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { MatIconModule } from "@angular/material/icon";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-operation-form',
  imports: [
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    BrCurrencyPipe
  ],
  templateUrl: './operation-form.component.html',
  styleUrl: './operation-form.component.css'
})
export class OperationFormComponent {
  private operationService = inject(OperationService);
  private loginService = inject(LoginService);
  private _operationForm = this.operationService.operationForm;
  readonly isExpense: Observable<boolean> = this.operationService.isExpense;
  // errosDestino: ErrorsObj[] = [
  //   {key: 'destino', code: 'minlength'},
  //   {key: 'destino', code: 'userNotExist'},
  //   {key: 'destino', code: 'emailInvalido'},
  //   {key: 'destino', code: 'accountLogged'},
  //   {key: 'destino', code: 'required'}
  // ];
  // errorValor: ErrorsObj[] = [
  //   {key: 'valor', code: 'valueUperSaldo'},
  //   {key: 'valor', code: 'invalidValue'}
  // ];
  filtraData = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== 0 && day !== 6;
  };

  ngOnInit(): void {
    this.operationService.buildForm(this.currentOp);
    this.checkError('destino');
    this.checkError('destino');
    this.checkError('vencimento');
  }

  get userDestino() {
    return this.operationService.userDestino
  }

  get saldo() {
    return this.loginService.user?.saldo;
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


  checkError(key: keyof ErrorsForm) {
    const errors = this.operationForm.get(key)?.errors;
    if(!errors) {
      this.operationService.updateErros(key);
    } else {
      this.operationService.updateErros(key, Object.keys(errors)[0]);
    }
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
    this.cursorend(event,formatado)
    this.checkError('valor');
  }

  cursorend(event: Event, value?: string) {
    const input = event.target as HTMLInputElement;
    let valor;
    if (!value) {
      valor = input.value;
    } else {
      valor = value;
    }
    input.setSelectionRange(valor.length,valor.length);
  }

  formataValor(valor: number) {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  transfSaldoTotal(){
    const saldoString = this.formataValor(this.saldo!);
    this.operationForm.get('valor')?.setValue(saldoString);
  }

  limparValor() {
    this.operationForm.get('valor')?.setValue('0,00');
  }

  disabledBtn(): boolean {
    let disabled = false;
    switch (this.currentOp.operation) {
      case Operation.PIX:
        disabled = !this.operationForm.get('destino')?.value?.length;
        break;
      case Operation.PAGAMENTO:
        disabled = !this.operationForm.get('vencimento')?.value;
        break;
      }
    if (this.operationForm.get('valor')?.value === '0,00') {
      disabled = true;
    }
    const errors = this.operationService.errorsForm;
    Object.values(errors).forEach(mensagem => {
      if (mensagem) {
        disabled = true;
      }
    });
    return disabled
  }


  submit(){
    if (this.currentOp.operation === Operation.PIX) {
      const form = this.operationForm.value;
      console.log(form);
    }
    const form = this.operationForm.value;
    console.log(form);
  }
}
