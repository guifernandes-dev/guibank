import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
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
    id: new FormControl<string>(''),
    descricao: new FormControl<string>('', [Validators.required]),
    vencimento: new FormControl<Date | null>(new Date(), [Validators.required]),
    pago: new FormControl<boolean>(false),
    valor: new FormControl('0,00', [Validators.required])
  })
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

  checkError(key: keyof ErrorsDialog, destino: boolean = false) {
    const errors = destino ? this.form.get('destino')?.get(key)?.errors : this.form.get(key)?.errors;
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
    disabled = !this.form.get('vencimento')?.value;
    disabled = !this.form.get('descricao')?.value;
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
      data: new Date(),
    }
    this.dialogRef.close(trans);
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
