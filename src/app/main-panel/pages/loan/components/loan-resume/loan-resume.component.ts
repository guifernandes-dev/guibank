import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-loan-resume',
  imports: [MatCardModule, BrCurrencyPipe],
  templateUrl: './loan-resume.component.html',
  styleUrl: './loan-resume.component.css'
})
export class LoanResumeComponent {
  private readonly loanService = inject(LoanService);
  
  get limiteTotal() {
    return this.loanService.limiteTotal;
  }

  get limiteDisp() {
    return this.limiteTotal;
  }

  get parcelasMax() {
    const numParcMax = this.loanService.numParcelasMax;
    const vrParcMin = this.loanService.vrParcelaMin;
    const parc = this.limiteDisp/numParcMax;
    if(parc >= vrParcMin) return numParcMax 
    return Math.floor(this.limiteDisp/vrParcMin);
  }

  get valorEmprestimos() {
    return this.loanService.valorLoans;
  }
}
