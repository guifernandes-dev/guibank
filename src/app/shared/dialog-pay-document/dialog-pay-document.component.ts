import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators, FormsModule, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { CardDocuments } from '../../main-panel/pages/dashboard/models/dash.model';
import { BrCurrencyPipe } from '../../pipe/br-currency.pipe';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { UtilService } from '../../core/util.services/util.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-dialog-overview',
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    BrCurrencyPipe,
    MatNativeDateModule,
    FormsModule
],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './dialog-pay-document.component.html',
  styleUrl: './dialog-pay-document.component.css'
})
export class DialogPayComponent {
  private readonly utilService = inject(UtilService);
  filtraData = this.utilService.filtraDataPG;
  readonly dialogRef = inject(MatDialogRef<DialogPayComponent>);
  trans = inject<CardDocuments>(MAT_DIALOG_DATA);

  // form = new FormGroup({
  //   id: new FormControl(this.trans.id),
  //   data: new FormControl(new Date(), [Validators.required]),
  // })
  // erroMessage = signal('');

  // checkError() {
  //   if(this.form.get('data')?.hasError('required')) {
  //     this.erroMessage.set('Data inválida');
  //   } else if(this.form.get('data')?.hasError('matDatepickerParse')) {
  //     this.erroMessage.set('Data inválida');
  //   } else {
  //     this.erroMessage.set('');
  //   }
  // }

  pagar() {
    //if(this.form.get('data')?.valid) {
    this.dialogRef.close({id: this.trans.id, data: new Date()});
    //}
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
