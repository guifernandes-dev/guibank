import { inject, Injectable, signal } from '@angular/core';
import { LoginService } from '../../../../core/login.services/login.service';
import { Loan } from '../../../../../server/models/db.model';
import { APIService } from '../../../../core/api.services/api.service';
import { UtilService } from '../../../../core/util.services/util.service';
import { first } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private readonly NUM_PARCELAS_MAX = 120;
  private readonly VR_PARCELA_MIN = 100;
  private readonly PARCELA_MAX_RENDA = 0.3;
  private readonly FATOR_MULT_JUROS = 2.6;
  private readonly loginService = inject(LoginService);
  private readonly apiService = inject(APIService);
  private readonly utilService = inject(UtilService);
  private isList$ = signal<boolean>(true);
  private userLoans$ = signal<Loan[]>([]);
  private tax$ = signal<number>(0);

  get tax() {
    return this.tax$;
  }

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

  get limiteDisp() {
    return this.limiteTotal;
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

  get parcelasMax() {
    const numParcMax = this.NUM_PARCELAS_MAX;
    const vrParcMin = this.VR_PARCELA_MIN;
    const parc = this.limiteDisp/numParcMax;
    if(parc >= vrParcMin) return numParcMax 
    return Math.floor(this.limiteDisp/vrParcMin);
  }

  initLoan() {
    const id = this.loginService.user()?.conta!
    this.apiService.getLoansByUserId(id)
      .pipe(first())
      .subscribe(loans => {
        this.loans.set(loans);
        this.apiService.getCDI()
          .pipe(first())
          .subscribe(cdi =>{
            const cdiam = this.utilService.converteTax(
              cdi.valor,
              this.FATOR_MULT_JUROS
            );
            this.tax.set(cdiam);
          })
      });
  }
}
