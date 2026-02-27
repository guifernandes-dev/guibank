import { inject, Injectable, signal } from '@angular/core';
import { Operation } from '../../../../../server/constants/operation.enum';
import { ErrorsForm, MenuOperation } from '../models/operation.models';
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
  private loginService = inject(LoginService);
  private apiService = inject(APIService);
  private transService = inject(TransactionsService);
  private _operationMenu: MenuOperation[] = [
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
  private currentOp$ = signal<MenuOperation>(this.operationMenu[0]);
  private _operationForm = new FormGroup({
    origem: new FormControl<string>(''),
    destino: new FormControl<string>('',{asyncValidators: this.validatorDestino()}),
    data: new FormControl<Date>(new Date(),[Validators.required]),
    descricao: new FormControl<string>(''),
    valor: new FormControl<string>('0,00', [this.validatorValor()]),
    tipo: new FormControl<Operation>(Operation.PIX,[Validators.required]),
    pago: new FormControl<boolean>(false),
    vencimento: new FormControl<Date | null>(null)
  });
  private _errors = signal<ErrorsForm>({
    destino: '',
    descricao: '',
    vencimento: '',
    valor: '',
  });
  private _tipoConta = new FormControl<string>('text');
  private userDestino$ = signal<string | null>(null);

  get userDestino() {
    return this.userDestino$();
  }

  get errorsForm() {
    return this._errors();
  }
  get tipoConta() {
    return this._tipoConta;
  }

  get operationForm() {
    return this._operationForm;
  }
  
  get operationMenu() {
    return this._operationMenu;
  }

  get currentOp(): MenuOperation {
    return this.currentOp$();
  }

  set currentOp(currentOp: MenuOperation) {
    this.currentOp$.set(currentOp);
  }

  buildForm({operation}: MenuOperation, reset: boolean = false): void {
    const user = this.loginService.user;
    const data = new Date();
    const isExpense = operation !== Operation.DEPOSITO;
    const origem = isExpense ? user!.conta : '';
    const destino = !isExpense ? user!.conta : '';
    const pago = this.currentOp.operation !== Operation.PAGAMENTO;
    this._operationForm.patchValue({
      origem,
      destino,
      data,
      pago,
      descricao: reset ? '' : this.operationForm.get('descricao')?.value,
      valor: reset ? '0,00': this.operationForm.get('valor')?.value,
      vencimento: operation === Operation.PAGAMENTO ? data : null,
      tipo: operation
    })
  }

  validatorDestino(): AsyncValidatorFn  {
    return (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
      const value = control.value;
      const user = this.loginService.user;

      if(user?.conta === value || user?.email === value) {
        return of({ accountLogged: 'Não pode ser o próprio usuário.'})
      }
      if (!value) {
        return of(null);
      }
      if (this.tipoConta?.value === 'text') {
        if (value.length !== 4) return of({minlength: 'Número de Conta deve ter 4 dígitos'})
        return this.apiService
          .getUserByAccount(value)
          .pipe(
            first(),
            map(contas => {
              if(contas.length) {
                this.userDestino$.set(contas[0].nome)
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
              this.userDestino$.set(contas[0].nome)
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
      
      if (number > saldoConta! && this.currentOp.operation !== Operation.DEPOSITO) return { valueUperSaldo: 'Valor maior que o saldo'}
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
        mensagem = this.operationForm.get(key)?.getError(code)
        break;
    }
    this._errors.update(errs => ({
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
          this.buildForm(this.currentOp,true)
          this.snackBar.open(
            'Transação salva com sucesso!',
            'Ok',
            { duration: this.duration, panelClass: 'snackbar-sucess'}
          );
        }
      });
  }
}
