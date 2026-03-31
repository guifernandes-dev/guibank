import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { BrCurrencyPipe } from '../../pipe/br-currency.pipe';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Transaction } from '../../../server/models/db.model';
import { UtilService } from '../../core/util.services/util.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dialog-overview',
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
  templateUrl: './dialog-pay-document.component.html',
  styleUrl: './dialog-pay-document.component.css'
})
export class DialogPayComponent {
  readonly dialogRef = inject(MatDialogRef<DialogPayComponent>);
  private readonly utilService = inject(UtilService);
  trans = inject<Transaction>(MAT_DIALOG_DATA);  

  get lang() {
    return this.utilService.langAtual;
  }

  pagar() {
    this.dialogRef.close({id: this.trans.id, data: new Date()});
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
