import { inject, Injectable } from '@angular/core';
import { LoginService } from '../login.services/login.service';
import { APIService } from '../api.services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogPayComponent } from '../../shared/dialog-pay-document/dialog-pay-document.component';
import { first, Observable } from 'rxjs';
import { Transaction } from '../../../server/models/db.model';
import { DialogDeleteComponent } from '../../shared/dialog-delete/dialog-delete.component';
import { UtilService } from '../util.services/util.service';
import { DialogEditComponent } from '../../shared/dialog-edit/dialog-edit.component';
import { ComponentType } from '@angular/cdk/overlay';
import { KeyType, OptionChangeDocs } from '../models/services.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private readonly loginService = inject(LoginService);
  private readonly apiService = inject(APIService);
  private readonly utilService = inject(UtilService);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(MatDialog);
  private readonly OPTIONS_CHANGE_DOCS: Record<KeyType, OptionChangeDocs> = {
    pay: {type: 'pay', mensagem: this.translate.instant('LOGIN.SNACKS.PAY')},
    edit: {type: 'edit', mensagem: this.translate.instant('LOGIN.SNACKS.EDIT')},
    delete: {type: 'delete', mensagem: this.translate.instant('LOGIN.SNACKS.DELETE')}
  }

  get saldos(): {rec: number, desp: number} {
    return this.loginService.userOp().reduce((saldo,trans)=>{
      if (trans.destino?.id === this.loginService.user()?.id && trans.pago) {
        return {...saldo, rec: saldo.rec+trans.valor }
      } else if (trans.origem?.id === this.loginService.user()?.id && trans.pago) {
        return {...saldo, desp: saldo.desp+trans.valor }
      }
      return saldo
    },{rec: 0, desp: 0})
  }

  get saldo() {
    return this.saldoRec - this.saldoDesp;
  }

  get saldoRec() {
    return this.saldos.rec;
  }

  get saldoDesp() {
    return this.saldos.desp;
  }

  updateUserOp(trans: Transaction) {
    this.loginService.userOp.update(userOps => {
      const ops = [...userOps];
      const opIndex = ops.findIndex(op => op.id === trans.id);
      
      if(opIndex<0) return userOps;
      ops[opIndex] = trans;
      return ops;
    });
  }

  payTrans(trans: Transaction) {
    const payTrans: Transaction = {
      ...trans,
      data: new Date()
    };
    const cbSubscribe = (trans: Transaction) => this.updateUserOp(trans);
    this.changeTrans(
      payTrans,
      DialogPayComponent,
      cbSubscribe,
      this.OPTIONS_CHANGE_DOCS.pay,
    );
  }

  editTrans(trans: Transaction) {
    const cbSubscribe = (trans: Transaction) => this.updateUserOp(trans);
    this.changeTrans(
      trans,
      DialogEditComponent,
      cbSubscribe,
      this.OPTIONS_CHANGE_DOCS.edit
    );
  }

  deleteTrans(trans: Transaction) {
    const cbSubscribe = (trans: Transaction) => {
      this.loginService.userOp.update(userOps => {
        const ops = [...userOps];
        const opIndex = ops.findIndex(op => op.id === trans.id);
        delete ops[opIndex];
        return ops;
      });
    }
    this.changeTrans(
      trans,
      DialogDeleteComponent,
      cbSubscribe,
      this.OPTIONS_CHANGE_DOCS.delete
    );
  }

  changeTrans<T>(
    trans: Transaction,
    dialogClass: ComponentType<T>,
    cbSubscribe: (trans: Transaction) => void,
    options: {type: 'edit' | 'pay' | 'delete', mensagem: string}
  ): void {
    const {mensagem, type} = options;
    const dialogRef = this.dialog.open(dialogClass, {
      data: trans,
    });

    dialogRef.afterClosed().subscribe((resp: Transaction) => {
      if (resp && resp.id) {
        const {id, data} = resp;
        let respAPI: Observable<Transaction>;
        switch (type) {
          case 'edit':
            respAPI = this.apiService.patchTransactionById(id, resp);
            break;
          case 'delete':
            respAPI = this.apiService.deleteTransactionById(id);
            break;
          default:
            respAPI = this.apiService.patchTransactionById(id, {pago: true, data});
            break;
        }
        respAPI
          .pipe(first())
          .subscribe((trans) => {            
            const dateTrans = {
              ...trans,
              data: new Date(trans.data),
              vencimento: trans.vencimento ? new Date(trans.vencimento) : null,
            }
            cbSubscribe(dateTrans);
            this.utilService.openSnackBar(mensagem,'snackbar-sucess');
          });
      }
    });
  }
}
