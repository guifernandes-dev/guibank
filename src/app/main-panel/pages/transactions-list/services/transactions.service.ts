import { inject, Injectable } from '@angular/core';
import { LoginService } from '../../../../core/login.services/login.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private loginService = inject(LoginService);

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

  
}
