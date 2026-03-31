import { Component, Inject, TemplateRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DateFormats } from '../../constants/front.enum';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dialog-pay-loan',
  imports: [MatDialogModule, MatButtonModule,NgTemplateOutlet, TranslatePipe],
  templateUrl: './dialog-pay-loan.component.html',
  styleUrl: './dialog-pay-loan.component.css'
})
export class DialogPayLoanComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      obj: any; template: TemplateRef<any>
    },
    public dialogRef: MatDialogRef<DialogPayLoanComponent>
  ) {}

  get dateFormats() {
    return DateFormats
  }

  pagar() {
    this.dialogRef.close(this.data.obj);
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
