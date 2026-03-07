import { Component, inject } from '@angular/core';
import { LoanService } from './services/loan.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-loan',
  imports: [MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './loan.component.html',
  styleUrl: './loan.component.css'
})
export class LoanComponent {
  private readonly loanService = inject(LoanService);

  get limiteDisp() {
    return this.loanService.limiteDisp;
  }

  get vrParcelaMin() {
    return this.loanService.vrParcelaMin;
  }

  get tax() {
    return this.loanService.tax$;
  }

  get loans() {
    return this.loanService.userLoans$;
  }

  get isList() {
    return this.loanService.isList$;
  }
}
