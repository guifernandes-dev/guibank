import { inject, Injectable, signal } from '@angular/core';
import { LoginService } from '../../../../core/login.services/login.service';
import { Loan } from '../../../../../server/models/db.model';
import { APIService } from '../../../../core/api.services/api.service';
import { UtilService } from '../../../../core/util.services/util.service';
import { first } from 'rxjs';
import { SisCredito } from '../../../../../server/constants/db.enum';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private readonly NUM_PARCELAS_MAX = 120;
  private readonly VR_PARCELA_MIN = 100;
  private readonly PARCELA_MAX_RENDA = 0.3;
  private readonly FATOR_MULT_JUROS = 20;
  private readonly loginService = inject(LoginService);
  private readonly apiService = inject(APIService);
  private readonly utilService = inject(UtilService);
  readonly isList$ = signal<boolean>(true);
  readonly userLoans$ = signal<Loan[]>([]);
  readonly tax$ = signal<number>(0);
  readonly loan$ = signal<Loan>({
    conta: this.loginService.user()!,
    data: new Date(),
    taxa: 0,
    totais: {juros: 0, amortizacao: 0, parcela: 0, taxa: 0},
    parcelas: [],
    sistema: SisCredito.PRICE,
    valor: 0,
  });

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
        this.userLoans$.set(loans);
        this.apiService.getCDI()
          .pipe(first())
          .subscribe(cdi =>{
            const cdiam = this.utilService.converteTax(
              cdi.valor/100,
              this.FATOR_MULT_JUROS
            );
            const cdiamround = this.utilService.round(cdiam,4);
            this.tax$.set(cdiamround);
          })
      });
  }
}
