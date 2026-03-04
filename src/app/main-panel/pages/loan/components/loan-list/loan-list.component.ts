import { Component, inject } from '@angular/core';
import { LoanService } from '../../services/loan.service';
import { DateTransPipe } from '../../../../../pipe/date-trans.pipe';
import { DateFormats } from '../../../../../constants/front.enum';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-loan-list',
  imports: [DateTransPipe, MatIconModule],
  templateUrl: './loan-list.component.html',
  styleUrl: './loan-list.component.css'
})
export class LoanListComponent {
  private readonly loanService = inject(LoanService);


  get dateFormats() {
    return DateFormats;
  }

  get loans() {
    return this.loanService.loans;
  }
}
