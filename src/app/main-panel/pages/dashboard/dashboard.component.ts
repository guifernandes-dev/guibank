import { Component, effect, inject, signal } from '@angular/core';
import { TableComponent } from './components/table/table.component';
import { ResumeComponent } from './components/resume/resume.component';
import { DocumentsOpenComponent } from './components/documents-open/documents-open.component';
import { LoansOpenComponent } from "./components/loans-open/loans-open.component";
import { NextCards } from '../../../constants/front.enum';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from './services/dashboard.service';
import { LoginService } from '../../../core/login.services/login.service';
import { LoanService } from '../loan/services/loan.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TableComponent, ResumeComponent, DocumentsOpenComponent, LoansOpenComponent, MatButtonModule, MatBadgeModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly dashService = inject(DashboardService);
  private readonly loginService = inject(LoginService);
  private readonly loanService = inject(LoanService);
  
  constructor() {
    effect(() => {
      const user = this.loginService.user();
      if (!user?.id) return;
      const hidden = JSON.parse(sessionStorage.getItem('hidden') || '{}')[user.id];      
      this.dashService.hidden.set(!!hidden);
      this.loanService.getUserLoans(user.id);
    });
  }

  get hidden() {
    return this.dashService.hidden;
  }

  get userOp() {
    return this.loginService.userOp;
  }

  get isLoading() {
    return this.loginService.isLoading;
  }

  get nextCards() {
    return NextCards;
  }

  get nextSelec() {
    return this.dashService.nextSelec$;
  }

  toogleNext(next: NextCards) {
    const atual =this.dashService.nextSelec$();
    if(next === atual) {
      this.dashService.nextSelec$.set(NextCards.NULL);
      return;
    };
    this.dashService.nextSelec$.set(next);
  }

  get documents() {
    return this.dashService.getDocuments
  }

  get parcelas() {
    return this.dashService.getParcelas
  }

  changeHidden() {
    const id = this.loginService.user()?.id;
    if(!id) return;
    const userHidden = JSON.parse(sessionStorage.getItem('hidden') || '{}');
    this.dashService.hidden.update(hidden => {
      const newHidden = !hidden
      userHidden[id] = newHidden;
      sessionStorage.setItem('hidden',JSON.stringify(userHidden))
      return newHidden;
    });
  }
}
