import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { BrCurrencyPipe } from '../../pipe/br-currency.pipe';
import { provideNativeDateAdapter } from '@angular/material/core';
import { LoanService } from '../../main-panel/pages/loan/services/loan.service';
import { Loan } from '../../../server/models/db.model';
import { UtilService } from '../../core/util.services/util.service';

@Component({
  selector: 'app-dialog-pay-loan-resume',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    BrCurrencyPipe
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './dialog-pay-loan-resume.component.html',
  styleUrl: './dialog-pay-loan-resume.component.css'
})
export class DialogPayLoanResumeComponent {

  readonly dialogRef = inject(MatDialogRef<DialogPayLoanResumeComponent>);
  parc = inject(MAT_DIALOG_DATA);


   pagar() {
    this.dialogRef.close(this.parc);
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
