import { inject, Injectable } from '@angular/core';
import { LoginService } from '../login.services/login.service';
import { APIService } from '../api.services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogPayComponent } from '../../shared/dialog-pay-document/dialog-pay-document.component';
import { first, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Transaction } from '../../../server/models/db.model';
import { DialogDeleteComponent } from '../../shared/dialog-delete/dialog-delete.component';
import { UtilService } from '../util.services/util.service';
import { DialogEditComponent } from '../../shared/dialog-edit/dialog-edit.component';
import { ComponentType } from '@angular/cdk/overlay';
import { KeyType, OptionChangeDocs } from '../models/services.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private readonly loginService = inject(LoginService);
  private readonly apiService = inject(APIService);
  private readonly utilService = inject(UtilService);
  private readonly dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private readonly OPTIONS_CHANGE_DOCS: Record<KeyType, OptionChangeDocs> = {
    pay: {type: 'pay', mensagem: 'Documento pago com sucesso!'},
    edit: {type: 'edit', mensagem: 'Documento alterado com sucesso!'},
    delete: {type: 'delete', mensagem: 'Documento deletado com sucesso!'}
  }

  get saldos(): {rec: number, desp: number} {
    return this.loginService.userOp().reduce((saldo,trans)=>{
      if (trans.destino?.conta === this.loginService.user()?.conta && trans.pago) {
        return {...saldo, rec: saldo.rec+trans.valor }
      } else if (trans.origem?.conta === this.loginService.user()?.conta && trans.pago) {
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
      const opIndex = userOps.findIndex(op => op.id === trans.id);
      userOps[opIndex] = trans;
      return userOps;
    });
  }

  payTrans(trans: Transaction) {
    const cbSubscribe = (trans: Transaction) => this.updateUserOp(trans);
    this.changeTrans(
      trans,
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
        const opIndex = userOps.findIndex(op => op.id === trans.id);
        delete userOps[opIndex];
        return userOps;
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
        const {id} = resp;
        let respAPI: Observable<Transaction>;
        switch (type) {
          case 'edit':
            respAPI = this.apiService.patchTransactionById(id, resp);
            break;
          case 'delete':
            respAPI = this.apiService.deleteTransactionById(id);
            break;
          default:
            respAPI = this.apiService.patchTransactionById(id, {id: resp.id, pago: true});
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
            this.snackBar.open(
              mensagem,
              'Ok',
              {
                duration: this.utilService.duration,
                panelClass: 'snackbar-sucess'
              }
            );
          });
      }
    });
  }
}
