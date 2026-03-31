import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { BrCurrencyPipe } from '../../pipe/br-currency.pipe';
import { Loan } from '../../../server/models/db.model';
import { SisCredito } from '../../../server/constants/db.enum';
import { provideNativeDateAdapter } from '@angular/material/core';
import { UtilService } from '../../core/util.services/util.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dialog-confirm-loan',
  imports: [MatDialogModule, MatButtonModule, BrCurrencyPipe, TranslatePipe],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './dialog-confirm-loan.component.html',
  styleUrl: './dialog-confirm-loan.component.css'
})
export class DialogConfirmLoanComponent {
  readonly dialogRef = inject(MatDialogRef<DialogConfirmLoanComponent>);
  private readonly utilService = inject(UtilService);
  loan = inject<Loan>(MAT_DIALOG_DATA);

  get sisCredito() {
    return SisCredito;
  }

  get lang() {
    return this.utilService.langAtual;
  }

  contratar() {
    this.dialogRef.close(this.loan);
  }

  fechar() {
    this.dialogRef.close();
  }
}
