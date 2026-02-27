import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { OperationService } from '../../services/operation.service';
import { Operation } from '../../../../../../server/constants/operation.enum';
import { ErrorsForm } from '../../models/operation.models';
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
  private operationService = inject(OperationService);
  private transService = inject(TransactionsService);
  private loginService = inject(LoginService);
  private _operationForm = this.operationService.operationForm;
  formataValor = this.loginService.formataValor;
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
    return this.transService.saldo;
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
    switch (this.currentOp.operation) {
      case Operation.PIX:
        disabled = !this.operationForm.get('destino')?.value?.length;
        break;
      case Operation.PAGAMENTO:
        disabled = !this.operationForm.get('vencimento')?.value;
        disabled = !this.operationForm.get('descricao')?.value;
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
    const transaction = {
      ...this.operationForm.value,
      valor: this.loginService.formataValorNumero(
        this.operationForm
          .get('valor')!
          .value!
      )
    } as Transaction;
    console.log(transaction);
    
    this.operationService.createTransaction(transaction);
  }
}
