import { inject, Injectable, signal } from '@angular/core';
import { LoginService } from '../../../../core/login.services/login.service';
import { Loan } from '../../../../../server/models/db.model';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private readonly NUM_PARCELAS_MAX = 120;
  private readonly VR_PARCELA_MIN = 100;
  private readonly PARCELA_MAX_RENDA = 0.3
  private readonly loginService = inject(LoginService);
  private isList$ = signal<boolean>(true);
  private userLoans$ = signal<Loan[]>([]);

  get isList() {
    return this.isList$;
  }

  get loans() {
    return this.userLoans$;
  }

  get valorLoans() {
    return this.userLoans$().reduce((sum, loan) =>{
      return sum += loan.valor
    },0)
  }

  get limiteTotal() {
    const user = this.loginService.user()
    if (user?.renda) {
      return (user?.renda * this.PARCELA_MAX_RENDA) * this.NUM_PARCELAS_MAX;
    }
    return 0;
  }

  get parcMaxRenda () {
    return this.PARCELA_MAX_RENDA;
  }

  get numParcelasMax() {
    return this.NUM_PARCELAS_MAX;
  }

  get vrParcelaMin() {
    return this.VR_PARCELA_MIN;
  }
}
