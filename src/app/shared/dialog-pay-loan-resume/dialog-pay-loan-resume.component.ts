import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { BrCurrencyPipe } from '../../pipe/br-currency.pipe';
import { provideNativeDateAdapter } from '@angular/material/core';
import { UtilService } from '../../core/util.services/util.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dialog-pay-loan-resume',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    BrCurrencyPipe,
    TranslatePipe
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './dialog-pay-loan-resume.component.html',
  styleUrl: './dialog-pay-loan-resume.component.css'
})
export class DialogPayLoanResumeComponent {
  private readonly utilService = inject(UtilService);
  readonly dialogRef = inject(MatDialogRef<DialogPayLoanResumeComponent>);
  parc = inject(MAT_DIALOG_DATA);

  get lang() {
    return this.utilService.langAtual;
  }

  pagar() {
    this.dialogRef.close(this.parc);
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
