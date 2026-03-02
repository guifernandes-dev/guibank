import { inject, Injectable } from '@angular/core';
import { LoginService } from '../login.services/login.service';
import { APIService } from '../api.services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogPayComponent } from '../../shared/dialog-pay-document/dialog-pay-document.component';
import { first } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Transaction } from '../../../server/models/db.model';
import { DialogDeleteComponent } from '../../shared/dialog-delete/dialog-delete.component';
import { UtilService } from '../util.services/util.service';
import { DialogEditComponent } from '../../shared/dialog-edit/dialog-edit.component';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private readonly loginService = inject(LoginService);
  private readonly apiService = inject(APIService);
  private readonly utilService = inject(UtilService);
  private readonly dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

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

  payTrans(trans: Partial<Transaction>) {
    const dialogRef = this.dialog.open(DialogPayComponent, {
      data: trans,
    });

    dialogRef.afterClosed().subscribe((resp: {id: string, data: Date}) => {
      if (resp) {
        const {id, data} = resp;
        this.apiService
          .patchTransactionById(id,{pago: true, data})
          .pipe(first())
          .subscribe(trans => {
            this.loginService.userOp.update(userOps => {
              const opIndex = userOps.findIndex(op => op.id === id);
              userOps[opIndex] = trans;
              return userOps;
            });
            this.snackBar.open(
              'Documento pago com sucesso!',
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

  editTrans(trans: Partial<Transaction>) {
    const dialogRef = this.dialog.open(DialogEditComponent, {
      data: trans,
    });

    dialogRef.afterClosed().subscribe((resp: Transaction) => {
      if (resp && resp.id) {
        const {id} = resp;
        this.apiService
          .patchTransactionById(id,resp)
          .pipe(first())
          .subscribe(trans => {
            this.loginService.userOp.update(userOps => {
              const opIndex = userOps.findIndex(op => op.id === id);
              userOps[opIndex] = trans;
              return userOps;
            });
            this.snackBar.open(
              'Documento pago com sucesso!',
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

  deleteTrans(trans: Transaction) {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      data: trans,
    });

    dialogRef.afterClosed().subscribe((resp: { id: string}) => {
      if (resp) {
        const {id} = resp;
        this.apiService
          .deleteTransactionById(id)
          .pipe(first())
          .subscribe(trans => {
            this.loginService.userOp.update(userOps => {
              const opIndex = userOps.findIndex(op => op.id === id);
              delete userOps[opIndex];
              return userOps;
            });
          });
      }
    });
  }
}
