import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { LoanService } from '../../services/loan.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { LoanListComponent } from "../loan-list/loan-list.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-loan-resume',
  imports: [MatCardModule, BrCurrencyPipe, MatTooltipModule, MatIconModule, LoanListComponent, RouterLink],
  templateUrl: './loan-resume.component.html',
  styleUrl: './loan-resume.component.css'
})
export class LoanResumeComponent {
  private readonly loanService = inject(LoanService);

  get taxa() {
    return this.loanService.tax$;
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

  get vrParcelaMin() {
    return this.loanService.vrParcelaMin;
  }

  get tax() {
    return this.loanService.tax$;
  }
}
