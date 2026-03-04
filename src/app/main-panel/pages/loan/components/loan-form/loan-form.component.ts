import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SisCredito } from '../../../../../../server/constants/db.enum';
import { MatSliderModule } from '@angular/material/slider';
import { LoanService } from '../../services/loan.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UtilService } from '../../../../../core/util.services/util.service';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from "@angular/material/icon";
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-loan-form',
  imports: [ReactiveFormsModule, MatSliderModule, MatInputModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatIconModule],
  templateUrl: './loan-form.component.html',
  styleUrl: './loan-form.component.css'
})
export class LoanFormComponent {
  private readonly loanService = inject(LoanService);
  private readonly utilService = inject(UtilService);
  form = new FormGroup({
    valor: new FormControl<string>(this.limiteDispString,[this.validatorValor()]),
    parcelas: new FormControl<number>(1,[Validators.required]),
    sistema: new FormControl<SisCredito>(SisCredito.PRICE,[Validators.required]),
  })
  erroValor$ = signal<string>('');
  valor$ = toSignal(this.form.get('valor')!.valueChanges);
  parcelasMax = signal(1);

  get sisCredito() {
    return SisCredito;
  }

  get limiteDispString() {
    return this.utilService.formataValor(this.loanService.limiteDisp);
  }

  constructor () {
    this.setParcelasMax(this.loanService.limiteDisp);
    effect(()=> {
      const valorText = this.valor$() || this.limiteDispString;
      const valor = this.utilService.formataValorNumero(valorText);
      this.setParcelasMax(valor);
    });
  }

  setParcelasMax(value: number) {
    const vrParcelaMin = this.loanService.vrParcelaMin;
    const qtParcMaxLimite = this.loanService.parcelasMax;
    const qtParcMaxValor = Math.floor(value/vrParcelaMin);
    const max = qtParcMaxValor<qtParcMaxLimite
      ? qtParcMaxValor
      : qtParcMaxLimite
    if(!max || max === 1) {
      this.form.controls['parcelas'].patchValue(1)
      this.parcelasMax.set(1);
      return;
    }
    this.form.controls['parcelas'].patchValue(
      Math.floor(max/2),
      { emitEvent: false }
    );
    this.parcelasMax.set(max);
  }

  formatar(event: Event) {
    const formatado = this.utilService.formataValorInput(event);
    this.form.controls['valor'].setValue(formatado);
    this.cursorend(event,formatado);
    this.checkError();
  }

  cursorend(event: Event, value?: string) {
    this.utilService.cursorend(event, value);
  }

  checkError() {
    const errors = this.form.controls['valor'].errors;
    if(!errors) {
      this.erroValor$.set('');
    } else {
      const code = Object.keys(errors)[0]
      if (this.form.controls['valor'].hasError('required')) {
        this.erroValor$.set('Campo é obrigatório');
      } else {
        this.erroValor$.set(this.form.controls['valor'].getError(code));
      }
    }
  }

  validatorValor(): ValidatorFn {
    return (control: AbstractControl<string>): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const limiteDisp = this.loanService.limiteDisp;
      const limiteMin = this.loanService.vrParcelaMin;
      const number = this.utilService.formataValorNumero(value);
      
      if (number > limiteDisp) {
        return { valueUperSaldo: 'Valor maior que o limite disponível'}
      }
      if (number < limiteMin) {
        return {
          invalidValue: `Valor mínimo R$${this.utilService.formataValor(limiteMin)}`
        }
      }
      return null
    }
  }

  submit() {

  }

  disabledBtn() {
    let disabled = false;
    if (this.form.get('valor')?.value === '0,00') {
      disabled = true;
    }
    if (!this.form.get('parcelas')?.value) {
      disabled = true;
    }
    const errors = this.erroValor$();
    Object.values(errors).forEach(mensagem => {
      if (mensagem) {
        disabled = true;
      }
    });
    return disabled
  }
}
