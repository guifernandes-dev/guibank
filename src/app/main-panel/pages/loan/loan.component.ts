import { Component, inject, OnInit } from '@angular/core';
import { LoanResumeComponent } from "./components/loan-resume/loan-resume.component";
import { LoanListComponent } from "./components/loan-list/loan-list.component";
import { LoanService } from './services/loan.service';
import { APIService } from '../../../core/api.services/api.service';
import { LoginService } from '../../../core/login.services/login.service';
import { first } from 'rxjs';
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
  private readonly apiService = inject(APIService);
  private readonly loginService = inject(LoginService);

  ngOnInit(): void {
    const id = this.loginService.user()?.conta!
    this.apiService.getLoansByUserId(id)
      .pipe(first())
      .subscribe(loans => {
        this.loanService.loans.set(loans);
      });
  }

  get loans() {
    return this.loanService.loans;
  }

  get isList() {
    return this.loanService.isList;
  }
}
