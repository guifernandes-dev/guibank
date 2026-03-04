import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { LoanService } from '../../services/loan.service';
import { PercentPipe } from '@angular/common';
import { BrPercentPipe } from '../../../../../pipe/br-percent.pipe';

@Component({
  selector: 'app-loan-resume',
  imports: [MatCardModule, BrCurrencyPipe, BrPercentPipe],
  templateUrl: './loan-resume.component.html',
  styleUrl: './loan-resume.component.css'
})
export class LoanResumeComponent {
  private readonly loanService = inject(LoanService);

  get taxa() {
    return this.loanService.tax;
  }
  
  get limiteTotal() {
    return this.loanService.limiteTotal;
  }

  get limiteDisp() {
    return this.loanService.limiteDisp;
  }

  get parcelasMax() {
    return this.loanService.parcelasMax;
  }

  get valorEmprestimos() {
    return this.loanService.valorLoans;
  }
}
