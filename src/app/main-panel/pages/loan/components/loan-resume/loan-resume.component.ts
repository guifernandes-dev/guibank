import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BrCurrencyPipe } from '../../../../../pipe/br-currency.pipe';
import { LoanService } from '../../services/loan.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from "@angular/router";
import { MatButtonModule } from '@angular/material/button';
import { BrPercentPipe } from '../../../../../pipe/br-percent.pipe';
import { LoginService } from '../../../../../core/login.services/login.service';
import { UtilService } from '../../../../../core/util.services/util.service';

@Component({
  selector: 'app-loan-resume',
  imports: [MatCardModule, BrCurrencyPipe, MatTooltipModule, MatIconModule, RouterLink, MatButtonModule, BrPercentPipe],
  templateUrl: './loan-resume.component.html',
  styleUrl: './loan-resume.component.css'
})
export class LoanResumeComponent {
  private readonly loanService = inject(LoanService);
  private readonly utilService = inject(UtilService);

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

  get userLoans() {
    return this.loanService.userLoans$;
  }

  get lang() {
    return this.utilService.langAtual;
  }
}
