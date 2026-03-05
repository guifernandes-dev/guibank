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
import { Installment } from '../../../../../../server/models/db.model';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { BrPercentPipe } from '../../../../../pipe/br-percent.pipe';

@Component({
  selector: 'app-loan-form',
  imports: [ReactiveFormsModule, MatSliderModule, MatInputModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatIconModule, BrCurrencyPipe, BrPercentPipe],
  templateUrl: './loan-form.component.html',
  styleUrl: './loan-form.component.css'
})
export class LoanFormComponent implements OnInit {
  private readonly loanService = inject(LoanService);
  private readonly utilService = inject(UtilService);
  erroValor$ = signal<string>('');
  form = new FormGroup({
    valor: new FormControl<string>(this.limiteDispString,[this.validatorValor()]),
    parcelas: new FormControl<number>(Math.floor(this.parcMaxLimite/2),[Validators.required]),
    sistema: new FormControl<SisCredito>(SisCredito.PRICE,[Validators.required]),
  })
  valor$ = toSignal(this.form.get('valor')!.valueChanges);
  parcelasMax = signal(1);

  get sisCredito() {
    return SisCredito;
  }

  get limiteDispString() {
    return this.utilService.formataValor(this.loanService.limiteDisp);
  }

  get parcMaxLimite() {
    return this.loanService.numParcelasMax;
  }

  get loan() {
    return this.loanService.loan$;
  }

  constructor () {
    effect(()=> {
      const valorText = this.valor$() || this.limiteDispString;
      const valor = this.utilService.formataValorNumero(valorText);
      this.setParcelasMax(valor);
    });
    effect(()=> {
      const tax = this.loanService.tax$();
      this.calculaParcela(tax);
    })
  }

  ngOnInit(): void {
    this.setParcelasMax(this.loanService.limiteDisp);
    this.form.valueChanges.subscribe(() => {
      this.calculaParcela();
    });
  }

  calculaParcela(i: number = this.loanService.tax$()) {
    const sistema = this.form.controls['sistema'].value;
    if (sistema === SisCredito.PRICE) {
      this.createPriceTable(i);
    } else {
      this.createSacTable(i);
    }
  }

  createPriceTable(i: number) {
    const c = this.utilService.formataValorNumero(this.form.controls['valor'].value!);
    const n = this.form.controls['parcelas'].value!;
    const parcela = c * i*((1+i)**n)/(((1+i)**n)-1);
    if(parcela) {
      const parcelaRound = this.utilService.round(parcela,2);
      let parcelas = [];
      let saldoDev = c;
      const totais = {juros: 0, amortizacao: 0, parcela: 0, taxa: 0};
      for (let index = 1; index <= n; index++) {
        const juros = this.utilService.round(saldoDev*i,2);
        const amortizacao = this.utilService.round(parcelaRound-juros,2);
        const installment: Installment = {
          item: index,
          juros,
          amortizacao,
          parcela: parcelaRound,
        }
        totais.juros += juros;
        totais.amortizacao += amortizacao;
        totais.parcela += parcela;
        if (index === n) {
          const taxaTotal = totais.juros / c;
          const taxaam = this.utilService
            .converteTax(taxaTotal,1,n,1);
          totais.taxa = taxaam
        }
        saldoDev -= amortizacao
        parcelas.push(installment);
      }
      this.loanService.loan$.update(loan => ({...loan, parcelas, totais}));
    }
  }

  createSacTable(i: number) {
    const c = this.utilService.formataValorNumero(this.form.controls['valor'].value!);
    const n = this.form.controls['parcelas'].value!;
    const amortizacao = this.utilService.round(c/n,2);
    let parcelas = [];
    let saldoDev = c;
    const totais = {juros: 0, amortizacao: 0, parcela: 0, taxa: 0};
    for (let index = 1; index <= n; index++) {
      const juros = this.utilService.round(saldoDev*i,2);
      const parcela = amortizacao+juros;
      const installment: Installment = {
        item: index,
        juros,
        amortizacao,
        parcela,
      };
      totais.juros += juros;
      totais.amortizacao += amortizacao;
      totais.parcela += parcela;
      if (index === n) {
        const taxaTotal = totais.juros / c;
        const taxaam = this.utilService
          .converteTax(taxaTotal,1,n,1);
        totais.taxa = taxaam
      }
      saldoDev -= amortizacao
      parcelas.push(installment);
    }
    this.loanService.loan$.update(loan => ({...loan, parcelas, totais}));
  }

  setParcelasMax(value: number) {
    const vrParcelaMin = this.loanService.vrParcelaMin;
    const qtParcMaxLimite = this.loanService.parcelasMax;
    const qtParcMaxValor = Math.floor(value/vrParcelaMin);
    let max = qtParcMaxValor<qtParcMaxLimite
      ? qtParcMaxValor
      : qtParcMaxLimite
    const parcelasAtual = this.form.controls['parcelas'].value!;
    const parcelas = parcelasAtual <= max ? parcelasAtual : max;
    if(!max || max === 1) {
      this.form.controls['parcelas'].patchValue(1)
      this.parcelasMax.set(1);
      return;
    }
    this.form.controls['parcelas'].patchValue(parcelas);
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
