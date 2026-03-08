import { inject, Injectable, signal } from '@angular/core';
import { LoginService } from '../../../../core/login.services/login.service';
import { Installment, Loan, Transaction } from '../../../../../server/models/db.model';
import { APIService } from '../../../../core/api.services/api.service';
import { UtilService } from '../../../../core/util.services/util.service';
import { first } from 'rxjs';
import { Operation, SisCredito } from '../../../../../server/constants/db.enum';
import { User } from '../../../../core/models/services.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmLoanComponent } from '../../../../shared/dialog-confirm-loan/dialog-confirm-loan.component';
import { ComponentType } from '@angular/cdk/overlay';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private readonly NUM_PARCELAS_MAX = 420;
  private readonly VR_PARCELA_MIN = 200;
  private readonly PARCELA_MAX_RENDA = 0.2;
  private readonly FATOR_MULT_JUROS = 2.6;
  private readonly loginService = inject(LoginService);
  private readonly apiService = inject(APIService);
  private readonly utilService = inject(UtilService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly isList$ = signal<boolean>(true);
  readonly userLoans$ = signal<Loan[]>([]);
  readonly tax$ = signal<number>(0);
  readonly loan$ = signal<Loan>({
    destino: {conta: '', email: '', nome: ''},
    data: new Date(),
    taxa: 0,
    pago: false,
    atuais: {juros: 0, amortizacao: 0, parcela: 0, saldo: 0},
    totais: {juros: 0, amortizacao: 0, parcela: 0, saldo: 0},
    parcelas: [],
    sistema: SisCredito.PRICE,
    valor: 0,
  });
  presentValue$ = signal<{item: number, parcela: number}[]>([]);

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

  parcelaHoje(item: number): number {
    const parcHoje = this.presentValue$();
    const index = parcHoje
      .findIndex(parc => parc.item === item);
    if(!parcHoje[index]) return 0;
    return parcHoje[index].parcela;
  }

  totalHoje(): number {
    const presValue = this.presentValue$();
    if(!presValue.length) return 0;
    return this.presentValue$().reduce((soma, parcela)=>{
      return soma+parcela.parcela;
    },0)
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

  createTrans(
    {id, destino, data, valor}: Loan,
    parc?: Installment,
    total?: number,
    type: 'contrato' | 'parcela' | 'quitar' = 'contrato'
  ): Transaction {
    const hoje = new Date();
    switch (type) {
      case 'contrato':
        return {
          origem: null,
          destino,
          data,
          descricao: `Contrato Nº ${id}`,
          valor: valor * 0.95,
          tipo: Operation.CREDITO,
          pago: true,
          vencimento: null
        } as Transaction;    
      case 'parcela':
        return {
          origem: destino,
          destino: null,
          data: hoje,
          descricao: `Parcela ${parc?.item} do Contrato ${id}`,
          valor: parc?.parcela || valor,
          pago: true,
          tipo: Operation.PAGAMENTO,
          vencimento: hoje,
        } as Transaction;
      default:
        return {
          origem: destino,
          destino: null,
          data: hoje,
          descricao: `Quitação do Contrato ${id}`,
          valor: total || valor,
          pago: true,
          tipo: Operation.PAGAMENTO,
          vencimento: hoje,
        } as Transaction;;
    }
  }

  createLoan() {
    const loan = this.loan$();
    const dialogRef = this.dialog.open(DialogConfirmLoanComponent,{data: loan});
    dialogRef.afterClosed().subscribe((loan: Loan) => {
      if(!loan) return;
      this.apiService.postLoan(loan)
        .pipe(first())
        .subscribe(loan => {
          const loanDate = this.ajustLoanDate(loan);
          this.userLoans$.update(loans => ([
            ...loans,
            loanDate
          ].sort((b,a)=> b.data.getTime()-a.data.getTime())));
          const trans = this.createTrans(loanDate);
          this.apiService.postTransaction(trans)
            .pipe(first())
            .subscribe(transApi => {
              const trans = this.ajustTransDate(transApi);
              this.loginService.userOp().push(trans);
            });
            this.router.navigate(['/loan']);
        });
    });
  }

  patchLoan(loanParam: Loan, parc?: Installment, total?: number) {
    if(!loanParam.id) return;
    this.apiService.patchLoanById(loanParam.id,loanParam)
      .pipe(first())
      .subscribe(loanApi => {
        const loan = this.ajustLoanDate(loanApi);
        this.userLoans$.update(loans => {
          const index = loans.findIndex(({id}) => id === loan.id)
          if(index<0) return loans;
          const loansCopy = [...loans]
          loansCopy[index] = loan;
          return loansCopy;
        });        
        const type = parc ? 'parcela' : 'quitar';
        const trans = this.createTrans(loan, parc, total, type);        
        this.apiService.postTransaction(trans)
          .pipe(first())
          .subscribe(transApi => {
            const trans = this.ajustTransDate(transApi);
            this.loginService.userOp().push(trans);
          });
      });
  }

  ajustLoanDate(loan: Loan): Loan {
    return {
      ...loan,
      data: new Date(loan.data),
      parcelas: loan.parcelas.map(parcela => ({
        ...parcela,
        vencimento: new Date(parcela.vencimento)
      }))
    }
  }

  ajustTransDate(trans: Transaction): Transaction {
    return {
      ...trans,
      data: new Date(trans.data),
      vencimento: trans.vencimento
        ? new Date(trans.vencimento)
        : null,
    }
  }

  getUserLoans(conta: string) {
    const loans = this.userLoans$();
    if(loans.length) return;
    this.apiService.getLoansByUserId(conta)
      .pipe(first())
      .subscribe(loans => {
        const loansDate = loans
          .map(loan => this.ajustLoanDate(loan))
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
