import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SisCredito } from '../../../../../../server/constants/db.enum';
import { MatSliderModule } from '@angular/material/slider';
import { LoanService } from '../../services/loan.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UtilService } from '../../../../../core/util.services/util.service';
import { ErrorsLoan } from '../../models/loan.models';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-loan-form',
  imports: [ReactiveFormsModule, MatSliderModule, MatInputModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatIconModule],
  templateUrl: './loan-form.component.html',
  styleUrl: './loan-form.component.css'
})
export class LoanFormComponent implements OnInit {
  private readonly loanService = inject(LoanService);
  private readonly utilService = inject(UtilService);
  valor = new FormControl<string>(this.limiteDispString,[this.validatorValor()]);
  parcelas = new FormControl<number>(1);
  sistema = new FormControl<SisCredito>(SisCredito.PRICE,[Validators.required]);
  erroMensagem$ = signal<ErrorsLoan>({
    valor: '',
    parcelas: ''
  });

  get sisCredito() {
    return SisCredito;
  }

  get limiteDispString() {
    return this.utilService.formataValor(this.loanService.limiteDisp);
  }

  ngOnInit(): void {
    this.setParcela();
  }

  get parcelasMax(): number {
    const value = this.utilService.formataValorNumero(this.valor.value!);
    const vrParcelaMin = this.loanService.vrParcelaMin;
    const qtParcMaxLimite = this.loanService.parcelasMax;
    const qtParcMaxValor = Math.floor(value/vrParcelaMin);
    return qtParcMaxValor<qtParcMaxLimite ? qtParcMaxValor : qtParcMaxLimite;
  }

  formatar(event: Event) {
    const formatado = this.utilService.formataValorInput(event);
    this.valor.setValue(formatado);
    this.setParcela()
    this.cursorend(event,formatado);
    this.checkError('valor');
    this.checkError('parcelas');
  }

  setParcela() {
    const max = Math.floor(this.parcelasMax);
    if(!max || max === 1) {
      this.parcelas.setValue(1);
      return;
    }
    this.parcelas.setValue(Math.floor(max/2));
  }

  cursorend(event: Event, value?: string) {
    this.utilService.cursorend(event, value);
  }

  checkError(key: keyof ErrorsLoan) {
    const errors = key === 'valor' ? this.valor.errors : this.parcelas.errors;
    if(!errors) {
      this.updateErros(key);
    } else {
      this.updateErros(key, Object.keys(errors)[0]);
    }
  }

  updateErros(key: keyof ErrorsLoan, code?: string) {
      let mensagem = '';
      switch (code) {
        case 'required':
          mensagem = 'Campo é obrigatório'
          break;
        case undefined:
          mensagem = ''
          break;
        default:
          mensagem = (key === 'valor' ? this.valor : this.parcelas).getError(code);
          break;
      }
      this.erroMensagem$.update(errs => ({
        ...errs,
        [key]: mensagem
      }))
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

  }
}
