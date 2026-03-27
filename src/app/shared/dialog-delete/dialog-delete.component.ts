import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { BrCurrencyPipe } from '../../pipe/br-currency.pipe';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Transaction } from '../../../server/models/db.model';
import { DateTransPipe } from '../../pipe/date-trans.pipe';
import { DateFormats } from '../../constants/front.enum';
import { UtilService } from '../../core/util.services/util.service';

@Component({
  selector: 'app-dialog-delete',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    BrCurrencyPipe,
    DateTransPipe
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './dialog-delete.component.html',
  styleUrl: './dialog-delete.component.css'
})
export class DialogDeleteComponent {
  readonly dialogRef = inject(MatDialogRef<DialogDeleteComponent>);
  private readonly utilService = inject(UtilService);
  trans = inject<Transaction>(MAT_DIALOG_DATA);

  get dateFormats() {
    return DateFormats;
  }

  get lang() {
    return this.utilService.langAtual;
  }

  deletar() {
    this.dialogRef.close({id: this.trans.id, data: new Date()});
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
