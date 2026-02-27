import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { OperationService } from '../../services/operation.service';
import { Operation } from '../../../../../../server/constants/operation.enum';
import { ErrorsForm, TransAccount } from '../../models/operation.models';
import { LoginService } from '../../../../../core/login.services/login.service';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { MatIconModule } from "@angular/material/icon";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TransactionsService } from '../../../transactions-list/services/transactions.service';
import { Transaction } from '../../../../../../server/models/db.model';
import {provideNativeDateAdapter} from '@angular/material/core';

@Component({
  selector: 'app-operation-form',
  providers: [provideNativeDateAdapter()],
  imports: [
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    BrCurrencyPipe
  ],
  templateUrl: './operation-form.component.html',
  styleUrl: './operation-form.component.css'
})
export class OperationFormComponent {
  private readonly operationService = inject(OperationService);
  private readonly transService = inject(TransactionsService);
  private readonly loginService = inject(LoginService);
  formataValor = this.loginService.formataValor;
  filtraData = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== 0 && day !== 6;
  };

  ngOnInit(): void {
    this.operationService.buildForm();
    this.checkError(this.destinoNumero ? 'conta' : 'email');
    this.checkError(this.destinoNumero ? 'conta' : 'email');
    this.checkError('vencimento');
  }

  get saldo() {
    return this.transService.saldo;
  }

  get operationForm() {
    return this.operationService.operationForm;
  }

  get operation() {
    return Operation;
  }

  get tipoConta() {
    return this.operationService.tipoConta
  }

  get destinoNumero() {
    return this.tipoConta.value === 'num';
  }

  get operationItems() {
    return this.operationService.operationMenu;
  }

  get currentOp() {
    return this.operationService.currentOp$;
  }

  get errorsForm() {
    return this.operationService.errorsForm$;
  }

  get destino() {
    return this.operationForm.get('destino')
  }

  get origem() {
    return this.operationForm.get('origem')
  }

  resetDestino() {
    this.destino?.get('nome')?.reset('');
    this.destino?.get('email')?.reset('');
    this.destino?.get('conta')?.reset('');
    this.errorsForm.update( erros => ({
      ...erros,
      conta: '',
      email: '',
    }))
  }


  checkError(key: keyof ErrorsForm, destino: boolean = false) {
    const errors = destino ? this.operationForm.get('destino')?.get(key)?.errors : this.operationForm.get(key)?.errors;
    if(!errors) {
      this.operationService.updateErros(key);
    } else {
      this.operationService.updateErros(key, Object.keys(errors)[0]);
    }
  }

  formatar(event: Event) {
    const formatado = this.loginService.formataValorInput(event);
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

  transfSaldoTotal(){
    const saldoString = this.formataValor(this.saldo);
    this.operationForm.get('valor')?.setValue(saldoString);
  }

  limparValor() {
    this.operationForm.get('valor')?.setValue('0,00');
  }

  disabledBtn(): boolean {
    let disabled = false;
    switch (this.currentOp().operation) {
      case Operation.PIX:
        disabled = !this.destino?.get('conta')?.value?.length;
        break;
      case Operation.PAGAMENTO:
        disabled = !this.operationForm.get('vencimento')?.value;
        disabled = !this.operationForm.get('descricao')?.value;
        break;
      }
    if (this.operationForm.get('valor')?.value === '0,00') {
      disabled = true;
    }
    const errors = this.errorsForm();
    Object.values(errors).forEach(mensagem => {
      if (mensagem) {
        disabled = true;
      }
    });
    return disabled
  }

  submit(){
    const valor = this.loginService.formataValorNumero(
      this.operationForm
        .get('valor')!
        .value!
    );
    const isExpense = this.currentOp().operation !== Operation.DEPOSITO;
    const isPix = this.currentOp().operation === Operation.PIX;
    const origem = isExpense ? this.origem?.value : null;
    const destino = !isExpense || isPix ? this.destino?.value : null;
    const transaction = {
      ...this.operationForm.value,
      data: new Date(),
      origem,
      destino,
      valor
    } as Transaction;
    this.operationService.createTransaction(transaction);
  }
}
