import { inject, Injectable, signal } from '@angular/core';
import { Operation } from '../../../../../server/constants/operation.enum';
import { ErrorsForm, MenuOperation, TransAccount } from '../models/operation.models';
import { first, map, Observable, of } from 'rxjs';
import { LoginService } from '../../../../core/login.services/login.service';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { APIService } from '../../../../core/api.services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransactionsService } from '../../transactions-list/services/transactions.service';
import { Transaction } from '../../../../../server/models/db.model';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private readonly duration = 4000;
  private snackBar = inject(MatSnackBar);
  private readonly loginService = inject(LoginService);
  private readonly apiService = inject(APIService);
  private readonly transService = inject(TransactionsService);
  operationMenu: MenuOperation[] = [
    {
      icon: 'send_money',
      label: 'PIX',
      operation: Operation.PIX
    },
    {
      icon: 'savings',
      label: 'DEPÓSITO',
      operation: Operation.DEPOSITO
    },
    {
      icon: 'payments',
      label: 'SAQUE',
      operation: Operation.SAQUE
    },
    {
      icon: 'money',
      label: 'DÉBITO',
      operation: Operation.DEBITO
    },
    {
      icon: 'request_quote',
      label: 'PAGAMENTO',
      operation: Operation.PAGAMENTO
    }
  ];
  currentOp$ = signal<MenuOperation>(this.operationMenu[0]);
  operationForm = new FormGroup({
    origem: new FormGroup({
      conta: new FormControl<string>(''),
      email: new FormControl<string>(''),
      nome: new FormControl<string>('')
    }),
    destino: new FormGroup({
      conta: new FormControl<string>('', {asyncValidators: this.validatorDestino()}),
      email: new FormControl<string>('', {asyncValidators: this.validatorDestino()}),
      nome: new FormControl<string>('')
    }),
    data: new FormControl<Date>(new Date(),[Validators.required]),
    descricao: new FormControl<string>(''),
    valor: new FormControl<string>('0,00', [this.validatorValor()]),
    tipo: new FormControl<Operation>(Operation.PIX,[Validators.required]),
    pago: new FormControl<boolean>(false),
    vencimento: new FormControl<Date | null>(null)
  });
  errorsForm$ = signal<ErrorsForm>({
    conta: '',
    email: '',
    descricao: '',
    vencimento: '',
    valor: '',
  });
  tipoConta = new FormControl<string>('num');

  buildForm(reset: boolean = false): void {
    const operation = this.currentOp$().operation
    const data = new Date();
    const isExpense = operation !== Operation.DEPOSITO;
    const {nome, conta, email} = this.loginService.user()!;
    const user = {conta, email, nome};
    const INITIAL_FORM = {
      origem: isExpense ? user : {conta: '', email: '', nome: ''},
      destino: !isExpense ? user : {conta: '', email: '', nome: ''},
      data,
      descricao: reset ? '' : this.operationForm.get('descricao')?.value,
      valor: reset ? '0,00': this.operationForm.get('valor')?.value,
      tipo: operation,
      pago: operation !== Operation.PAGAMENTO,
      vencimento: operation === Operation.PAGAMENTO ? data : null,
    };
    this.operationForm.reset(INITIAL_FORM);
  }

  validatorDestino(): AsyncValidatorFn  {
    return (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
      const value = control.value;
      const user = this.loginService.user();

      if(user?.conta === value || user?.email === value) {
        return of({ accountLogged: 'Não pode ser o próprio usuário'})
      }
      if (!value) {
        return of(null);
      }
      if (this.tipoConta?.value === 'num') {
        if (value.length !== 4) return of({minlength: 'Número de Conta deve ter 4 dígitos'})
        return this.apiService
          .getUserByAccount(value)
          .pipe(
            first(),
            map(contas => {
              if(contas.length) {
                const {nome, id, email} = contas[0];
                this.operationForm.patchValue({destino: {nome, conta: id, email}});
                return null;
              }
              return { userNotExist: 'Usuário não encontrado'}
            })
          )
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailRegex.test(value)) return of({ emailInvalido: 'Formato de e-mail inválido' })
      return this.apiService
        .getUserByEmail(value)
        .pipe(
          first(),
          map(contas => {        
            if(contas.length) {
              const {nome, id, email} = contas[0];
              this.operationForm.patchValue({destino: {nome, conta: id, email}});
              return null;
            }
            return { userNotExist: 'Usuário não encontrado'}
          })
        )
    }
  }

  validatorValor(): ValidatorFn {
    return (control: AbstractControl<string>): ValidationErrors | null => {
      const saldoConta = this.transService.saldo
      const value = control.value;
      if (!value) return null;
      const number = this.loginService.formataValorNumero(value);
      
      if (number > saldoConta! && this.currentOp$().operation !== Operation.DEPOSITO) return { valueUperSaldo: 'Valor maior que o saldo'}
      if (number < 0.01) return { invalidValue: 'Valor mínimo R$0,01' }
      return null
    }
  }

  updateErros(key: keyof ErrorsForm, code?: string) {
    let mensagem = '';
    switch (code) {
      case 'required':
        mensagem = 'Campo é obrigatório'
        break;
      case 'matDatepickerParse':
        mensagem = 'Data inválida'
        break;
      case undefined:
        mensagem = ''
        break;
      default:
        mensagem = key === 'conta' || key === 'email'
          ? this.operationForm.get('destino')?.get(key)?.getError(code)
          : this.operationForm.get(key)?.getError(code);
        break;
    }
    this.errorsForm$.update(errs => ({
      ...errs,
      [key]: mensagem
    }))
  }

  createTransaction(transaction: Transaction) {
    this.apiService.postTransaction(transaction)
      .pipe(first())
      .subscribe(transaction => {
        if(!transaction) {
          this.snackBar.open(
            'Erro ao salvar operação',
            'Ok',
            { duration: this.duration, panelClass: 'snackbar-erro'}
          );
        } else {
          this.loginService.userOp().push(transaction);
          this.buildForm(this.currentOp$().operation !== Operation.PAGAMENTO);
          this.snackBar.open(
            'Transação salva com sucesso!',
            'Ok',
            { duration: this.duration, panelClass: 'snackbar-sucess'}
          );
        }
      });
  }
}
