import { inject, Injectable, signal } from '@angular/core';
import { LoginService } from '../../../../core/login.services/login.service';
import { Loan } from '../../../../../server/models/db.model';
import { APIService } from '../../../../core/api.services/api.service';
import { UtilService } from '../../../../core/util.services/util.service';
import { first } from 'rxjs';
import { SisCredito } from '../../../../../server/constants/db.enum';
import { User } from '../../../../core/models/services.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmLoanComponent } from '../../../../shared/dialog-confirm-loan/dialog-confirm-loan.component';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private readonly NUM_PARCELAS_MAX = 420;
  private readonly VR_PARCELA_MIN = 200;
  private readonly PARCELA_MAX_RENDA = 0.2;
  private readonly FATOR_MULT_JUROS = 2.6;
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);
  private readonly apiService = inject(APIService);
  private readonly utilService = inject(UtilService);
  private readonly dialog = inject(MatDialog);
  readonly isList$ = signal<boolean>(true);
  readonly userLoans$ = signal<Loan[]>([]);
  readonly tax$ = signal<number>(0);
  readonly loan$ = signal<Loan>({
    destino: {conta: '', email: '', nome: ''},
    data: new Date(),
    taxa: 0,
    totais: {juros: 0, amortizacao: 0, parcela: 0, saldo: 0},
    parcelas: [],
    sistema: SisCredito.PRICE,
    valor: 0,
  });

  get valorLoans() {
    return this.userLoans$()
      .flatMap(l => l.parcelas)
      .filter(p => !p.pago)
      .reduce((soma, p) => soma + p.parcela, 0);
  }

  get limiteTotal() {
    const user = this.loginService.user()
    if (user?.renda) {
      return (user?.renda * this.PARCELA_MAX_RENDA) * this.NUM_PARCELAS_MAX;
    }
    return 0;
  }

  get limiteDisp() {
    return this.limiteTotal - this.valorLoans;
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

  initTax(user?: User) {
    if(user?.conta){
      const {conta, email, nome} = user;
      this.loan$.update(loan => ({
        ...loan,
        destino: {conta,email,nome}
      }))
    }
    if(this.tax$()) return;
    this.apiService.getCDI()
      .pipe(first())
      .subscribe(cdi =>{
        const cdiam = this.utilService.converteTax(
          cdi.valor/100,
          this.FATOR_MULT_JUROS
        );
        const cdiamround = Math.round(cdiam*100000)/100000;
        this.tax$.set(cdiamround);
      })
  }

  createLoan() {
    const loan = this.loan$();
    const dialogRef = this.dialog.open(DialogConfirmLoanComponent,{
      data: loan
    });

    dialogRef.afterClosed().subscribe((loan: Loan) => {
      if(loan) {
        const loanDate = {
          ...this.loan$(),
          data: new Date()
        };
        this.apiService.postLoan(loan)
          .pipe(first())
          .subscribe(loan => {
            const loanDate = {
              ...loan,
              data: new Date(loan.data),
            }
            this.userLoans$.update(loans => ([
              ...loans,
              loanDate
            ].sort((b,a)=> b.data.getTime()-a.data.getTime())))
          });
        this.router.navigate(['/loan']);
      }  
    });
  }

  getUserLoans(conta: string) {
    const loans = this.userLoans$();
    if(loans.length) return;
    this.apiService.getLoansByUserId(conta)
      .pipe(first())
      .subscribe(loans => {
        const loansDate = loans
          .map(loan => ({
            ...loan,
            data: new Date(loan.data),
            parcelas: loan.parcelas.map(parcela => ({
              ...parcela,
              vencimento: new Date(parcela.vencimento)
            }))
          }))
          .sort((a,b) => b.data.getTime() - a.data.getTime());
        this.userLoans$.set(loansDate);
      });
  }

  calcularPMT(PV: number, i: number, n: number): number {
    if(!PV || !i || !n) return 0;
    const fator = Math.pow(1 + i, n);
    return PV * (i * fator) / (fator - 1);
  }
}
