import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { UtilService } from '../../core/util.services/util.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Transaction } from '../../../server/models/db.model';
import { ErrorsDialog } from '../../main-panel/pages/transfer/models/operation.models';
import { TransactionsService } from '../../core/transactions.services/transactions.service';
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

@Component({
  selector: 'app-dialog-overview',
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatNativeDateModule,
    FormsModule,
    MatSlideToggleModule
],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './dialog-edit.component.html',
  styleUrl: './dialog-edit.component.css'
})
export class DialogEditComponent implements OnInit{
  private readonly utilService = inject(UtilService);
  private readonly transService = inject(TransactionsService);
  filtraData = this.utilService.filtraData;
  readonly dialogRef = inject(MatDialogRef<DialogEditComponent>);
  trans = inject<Transaction>(MAT_DIALOG_DATA);

  form = new FormGroup({
    descricao: new FormControl<string>('', [Validators.required]),
    vencimento: new FormControl<Date | null>(new Date(), [Validators.required]),
    pago: new FormControl<boolean>(false),
    valor: new FormControl('0,00', [Validators.required])
  });
  erroMessage$ = signal<ErrorsDialog>({
    descricao: '',
    vencimento: '',
    valor: ''
  });

  get saldo() {
    return this.transService.saldo;
  }

  ngOnInit(): void {
    const {descricao, vencimento, valor, pago} = this.trans;
    this.form.patchValue({
      descricao,
      valor: this.utilService.formataValor(valor),
      pago,
      vencimento
    })
  }

  formatar(event: Event) {
    const formatado = this.utilService.formataValorInput(event);
    this.form.get('valor')?.setValue(formatado);
    this.cursorend(event,formatado)
    this.checkError('valor');
  }

  validatorValor(): ValidatorFn {
    return (control: AbstractControl<string>): ValidationErrors | null => {
      const saldoConta = this.transService.saldo
      const value = control.value;
      if (!value) return null;
      const number = this.utilService.formataValorNumero(value);
      
      if (number > saldoConta! && this.form.get('pago')?.value) {
        return { valueUperSaldo: 'Valor maior que o saldo'}
      }
      if (number < 0.01) return { invalidValue: 'Valor mínimo R$0,01' }
      return null
    }
  }

  cursorend(event: Event, value?: string) {
    this.utilService.cursorend(event, value);
  }

  checkError(key: keyof ErrorsDialog) {
    const errors = this.form.get(key)?.errors;
    if(!errors) {
      this.updateErros(key);
    } else {
      this.updateErros(key, Object.keys(errors)[0]);
    }
  }

  updateErros(key: keyof ErrorsDialog, code?: string) {
    let mensagem = '';
    switch (code) {
      case 'required':
        mensagem = 'Campo é obrigatório'
        break;
      case undefined:
        mensagem = ''
        break;
      default:
        mensagem = this.form.get(key)?.getError(code);
        break;
    }
    this.erroMessage$.update(errs => ({
      ...errs,
      [key]: mensagem
    }))
  }

  disabledBtn(): boolean {
    let disabled = false;
    disabled = !this.form.get('vencimento')?.value || !this.form.get('descricao')?.value;
    if (
      this.form.get('valor')?.value === '0,00'
      || (
        this.form.get('pago')?.value
        && this.form.get('valor')?.value === this.utilService.formataValor(this.saldo)
      )
    ) {
      disabled = true;
    }
    const errors = this.erroMessage$();
    Object.values(errors).forEach(mensagem => {
      if (mensagem) {
        disabled = true;
      }
    });
    return disabled
  }

  submit() {
    const trans = {
      ...this.trans,
      ...this.form.value,
      valor: this.utilService.formataValorNumero(this.form.get('valor')?.value!),
      data: new Date(),
    }
    this.dialogRef.close(trans);
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
