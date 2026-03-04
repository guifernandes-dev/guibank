import { Component, inject, OnInit } from '@angular/core';
import { LoanResumeComponent } from "./components/loan-resume/loan-resume.component";
import { LoanListComponent } from "./components/loan-list/loan-list.component";
import { LoanService } from './services/loan.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoanFormComponent } from './components/loan-form/loan-form.component';

@Component({
  selector: 'app-loan',
  imports: [LoanResumeComponent, LoanListComponent, LoanFormComponent, MatButtonModule, MatIconModule],
  templateUrl: './loan.component.html',
  styleUrl: './loan.component.css'
})
export class LoanComponent implements OnInit {
  private readonly loanService = inject(LoanService);

  ngOnInit(): void {
    this.loanService.initLoan();
  }

  get limiteDisp() {
    return this.loanService.limiteDisp;
  }

  get vrParcelaMin() {
    return this.loanService.vrParcelaMin;
  }

  get tax() {
    return this.loanService.tax;
  }

  get loans() {
    return this.loanService.loans;
  }

  get isList() {
    return this.loanService.isList;
  }
}
