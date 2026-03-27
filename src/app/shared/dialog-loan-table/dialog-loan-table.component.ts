import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { BrCurrencyPipe } from '../../pipe/br-currency.pipe';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Installment, Loan } from '../../../server/models/db.model';
import { DateFormats } from '../../constants/front.enum';
import { MatIconModule } from '@angular/material/icon';
import { Operation } from '../../../server/constants/db.enum';
import { InstallmentsTableComponent } from "../../main-panel/pages/loan/components/installments-table/installments-table.component";
import { UtilService } from '../../core/util.services/util.service';

@Component({
  selector: 'app-dialog-loan-table',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    BrCurrencyPipe,
    MatIconModule,
    InstallmentsTableComponent
],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './dialog-loan-table.component.html',
  styleUrl: './dialog-loan-table.component.css'
})
export class DialogLoanTableComponent {
  readonly dialogRef = inject(MatDialogRef<DialogLoanTableComponent>);
  private readonly utilService = inject(UtilService);
  loan = inject<Loan>(MAT_DIALOG_DATA);

  get lang() {
    return this.utilService.langAtual;
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
