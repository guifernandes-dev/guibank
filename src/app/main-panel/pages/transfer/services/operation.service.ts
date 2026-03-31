import { inject, Injectable, signal } from '@angular/core';
import { ErrorsForm, MenuOperation } from '../models/operation.models';
import { catchError, first, map, Observable, of } from 'rxjs';
import { LoginService } from '../../../../core/login.services/login.service';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { APIService } from '../../../../core/api.services/api.service';
import { TransactionsService } from '../../../../core/transactions.services/transactions.service';
import { Account, Transaction } from '../../../../../server/models/db.model';
import { UtilService } from '../../../../core/util.services/util.service';
import { Operation } from '../../../../../server/constants/db.enum';
import { User } from '../../../../core/models/services.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private readonly loginService = inject(LoginService);
  private readonly apiService = inject(APIService);
  private readonly transService = inject(TransactionsService);
  private readonly utilService = inject(UtilService);
  private readonly translate = inject(TranslateService);
  operationMenu: MenuOperation[] = this.utilService.transTypes.slice(0,-1);
  currentOp$ = signal<MenuOperation>(this.operationMenu[0]);
  operationForm = new FormGroup({
    origem: new FormGroup({
      id: new FormControl<string>(''),
      email: new FormControl<string>(''),
      nome: new FormControl<string>('')
    }),
    destino: new FormGroup({
      id: new FormControl<string>('', {asyncValidators: this.validatorDestino()}),
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
    id: '',
    email: '',
    descricao: '',
    vencimento: '',
    valor: '',
  });
  tipoConta = new FormControl<string>('num');

  buildForm(userLogged: User | null, reset: boolean = false): void {
    if(!userLogged) return;
    const {nome, id, email} = userLogged;
    const operation = this.currentOp$().operation
    const data = new Date();
    const isExpense = operation !== Operation.DEPOSITO;
    const user = {id, email, nome};
    const INITIAL_FORM = {
      origem: isExpense ? user : {id: '', email: '', nome: ''},
      destino: !isExpense ? user : {id: '', email: '', nome: ''},
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
      const cbUserNotFound = ()=> of({ userNotExist: 'ERRORS.USER_NOT_FOUND'});
      const cbFound = (conta: Account) => {
          const {nome, id, email} = conta;
          this.operationForm.patchValue({destino: {nome, id, email}});
          return null;
      };

      if(user?.id === value || user?.email === value) {
        return of({ accountLogged: 'ERRORS.LOGGED_ACCOUNT'})
      }
      if (!value) {
        return of(null);
      }
      if (this.tipoConta?.value === 'num') {
        if (value.length !== 4) return of({minlength: 'ERRORS.MIN_LENGTH'})
        return this.apiService
          .getUserById(value)
          .pipe(
            first(),
            map(cbFound),
            catchError(cbUserNotFound)
          )
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailRegex.test(value)) return of({ emailInvalido: 'ERRORS.INVALID_EMAIL' })
      return this.apiService
        .getUserByEmail(value)
        .pipe(
          first(),
          map(cbFound),
          catchError(cbUserNotFound)
        )
    }
  }

  validatorValor(): ValidatorFn {
    return (control: AbstractControl<string>): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const saldoConta = this.transService.saldo
      const number = this.utilService.formataValorNumero(value);
      
      if (
        number > saldoConta!
        && this.currentOp$().operation !== Operation.DEPOSITO
        && (
          this.currentOp$().operation !== Operation.PAGAMENTO
          || this.operationForm.get('pago')?.value
        )
      ) return { valueUperSaldo: 'ERRORS.VALUE_BIGGEST'}
      if (number < 0.01) return { invalidValue: 'ERRORS.INVALID_VALUE' }
      return null
    }
  }

  updateErros(key: keyof ErrorsForm, code?: string) {
    let mensagem = '';
    switch (code) {
      case 'required':
        mensagem = 'ERRORS.REQUIRED_FIELD'
        break;
      case 'matDatepickerParse':
        mensagem = 'ERRORS.INVALID_DATE'
        break;
      case undefined:
        mensagem = ''
        break;
      default:
        mensagem = key === 'id' || key === 'email'
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
      .subscribe({
        next: transaction => {
          this.loginService.userOp().push({
            ...transaction,
            data: new Date(transaction.data),
            vencimento: transaction.vencimento
              ? new Date(transaction.vencimento)
              : null,
          });
          const user = this.loginService.user();
          this.buildForm(user, this.currentOp$().operation !== Operation.PAGAMENTO);
          const message = this.translate.instant('TRANSFER.SUCCESS');
          this.utilService.openSnackBar(message,'Ok','snackbar-sucess');
        },
        error: () => {
          const message = this.translate.instant('TRANSFER.ERRO');
          this.utilService.openSnackBar(message,'Ok');
        }
      });
  }
}
