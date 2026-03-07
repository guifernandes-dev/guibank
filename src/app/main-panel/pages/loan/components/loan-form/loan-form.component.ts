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
import { Installment, Loan, LoanTotal } from '../../../../../../server/models/db.model';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { BrPercentPipe } from '../../../../../pipe/br-percent.pipe';
import { MatDialog } from '@angular/material/dialog';
import { DialogLoanTableComponent } from '../../../../../shared/dialog-loan-table/dialog-loan-table.component';
import { LoginService } from '../../../../../core/login.services/login.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-loan-form',
  imports: [ReactiveFormsModule, MatSliderModule, MatInputModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatIconModule, BrCurrencyPipe, BrPercentPipe, MatButtonToggleModule, RouterModule],
  templateUrl: './loan-form.component.html',
  styleUrl: './loan-form.component.css'
})
export class LoanFormComponent implements OnInit {
  private readonly loanService = inject(LoanService);
  private readonly loginService = inject(LoginService);
  private readonly utilService = inject(UtilService);
  private readonly dialog = inject(MatDialog);
  erroValor$ = signal<string>('');
  form = new FormGroup({
    valor: new FormControl<string>('0,00',[this.validatorValor()]),
    parcelas: new FormControl<number>(1,[Validators.required]),
    sistema: new FormControl<SisCredito>(SisCredito.PRICE,[Validators.required]),
  })
  // valor$ = toSignal(this.form.get('valor')!.valueChanges);
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

  get valorEmprestimos() {
    return this.loanService.valorLoans;
  }

  constructor () {
    // effect(()=> {
    //   const valorText = this.valor$() || this.limiteDispString;
    //   const valor = this.utilService.formataValorNumero(valorText);
    //   this.setParcelasMax(valor);
    // });
    effect(()=> {
      this.loanService.tax$();
      const user = this.loginService.user();
      if(user?.conta) {
        this.loanService.initLoan(user);
        this.form.patchValue({
          valor: this.utilService.formataValor(this.loanService.limiteDisp),
          parcelas: this.parcMaxLimite / 2,
        })
      };
    });
  }

  ngOnInit(): void {
    this.form.controls['valor'].valueChanges.subscribe(valor => {
      if(valor) {
        const valorNum = this.utilService.formataValorNumero(valor);
        this.setParcelasMax(valorNum);
      }
    });
    this.form.valueChanges.subscribe(() => {
      this.calculaParcela();
    });
  }

  calculaParcela(i: number = this.loanService.tax$()) {
    const form = this.form.value;
    const valor = this.utilService.formataValorNumero(form.valor!);
    if(!valor || !form.parcelas) {
      this.loanService.loan$.update(loan => {
        return {
          ...loan,
          parcelas: []
        }
      });
      return;
    }
    if(!form.sistema) return;
    this.createTable(i, valor, form.parcelas, form.sistema);
  }

  createTable(taxa: number, vp: number, tempo: number, sistema: SisCredito) {
    let saldo = vp;
    let parcelas: Installment[] = [];
    let parcela: number = 0;
    let amortizacao: number = 0;
    const totais: LoanTotal = {juros: 0, amortizacao: 0, parcela: 0, saldo: vp};
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    const sisIsPrice = sistema === SisCredito.PRICE;
    if(sisIsPrice) {
      parcela = this.loanService.calcularPMT(vp,taxa,tempo);
    } else {
      amortizacao = vp/tempo;
    };
    for (let index = 1; index <= tempo; index++) {
      const juros = saldo*taxa;
      const vencimento = new Date(hoje);
      vencimento.setMonth(hoje.getMonth() + index);
      if(sisIsPrice) {
        parcela = index === tempo ? saldo + juros : parcela;
        amortizacao = parcela-juros;
      } else {
        parcela = amortizacao+juros;
      }
      saldo -= amortizacao;
      const installment: Installment = {
        item: index,
        pago: false,
        saldo,
        juros,
        amortizacao,
        parcela,
        vencimento,
      };
      totais.juros += juros;
      totais.amortizacao += amortizacao;
      totais.parcela += parcela;
      totais.saldo -= amortizacao;
      parcelas.push(installment);
    }
    this.loanService.loan$.update(loan => {
      const loanAjust: Loan = {
        ...loan,
        sistema,
        taxa: taxa,
        valor: vp,
        parcelas,
        totais
      };
      return loanAjust;
    });
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

  viewTable() {
    const dialogRef = this.dialog.open(DialogLoanTableComponent, {
      data: this.loan(),
    });
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
