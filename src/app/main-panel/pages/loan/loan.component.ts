import { Component, effect, inject, OnInit } from '@angular/core';
import { LoanService } from './services/loan.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from "@angular/router";
import { LoginService } from '../../../core/login.services/login.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-loan',
  imports: [MatButtonModule, MatIconModule, RouterModule, TranslatePipe],
  templateUrl: './loan.component.html',
  styleUrl: './loan.component.css'
})
export class LoanComponent implements OnInit {
  private readonly loanService = inject(LoanService);
  private readonly loginService = inject(LoginService);

  constructor() {
    effect(() => {
      const user = this.loginService.user();
      if (!user?.id) return;
      this.loanService.getUserLoans(user.id);
    });
  }

  ngOnInit(): void {
    this.loanService.initTax();
  }

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
