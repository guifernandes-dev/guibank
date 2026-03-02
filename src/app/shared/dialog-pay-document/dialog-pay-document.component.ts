import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { BrCurrencyPipe } from '../../pipe/br-currency.pipe';
import { provideNativeDateAdapter } from '@angular/material/core';
import { UtilService } from '../../core/util.services/util.service';
import { Transaction } from '../../../server/models/db.model';

@Component({
  selector: 'app-dialog-overview',
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
  templateUrl: './dialog-pay-document.component.html',
  styleUrl: './dialog-pay-document.component.css'
})
export class DialogPayComponent {
  private readonly utilService = inject(UtilService);
  readonly dialogRef = inject(MatDialogRef<DialogPayComponent>);
  trans = inject<Transaction>(MAT_DIALOG_DATA);

  pagar() {
    this.dialogRef.close({id: this.trans.id, data: new Date()});
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
