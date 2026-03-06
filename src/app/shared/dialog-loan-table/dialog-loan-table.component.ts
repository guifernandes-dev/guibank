import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { BrCurrencyPipe } from '../../pipe/br-currency.pipe';
import { DateTransPipe } from '../../pipe/date-trans.pipe';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Installment, Loan } from '../../../server/models/db.model';
import { DateFormats } from '../../constants/front.enum';
import { MatIconModule } from '@angular/material/icon';
import { Operation } from '../../../server/constants/db.enum';
import { AlertClassPipe } from '../../pipe/alert-class.pipe';

@Component({
  selector: 'app-dialog-loan-table',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    BrCurrencyPipe,
    DateTransPipe,
    MatIconModule,
    AlertClassPipe
],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './dialog-loan-table.component.html',
  styleUrl: './dialog-loan-table.component.css'
})
export class DialogLoanTableComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<DialogLoanTableComponent>);
  loan = inject<Loan>(MAT_DIALOG_DATA);
  presentValue$ = signal(0);

  ngOnInit(): void {
    const valueToday = this.loan.parcelas
      .filter(parc => !parc.pago)
      .reduce((soma, parc)=>{
        const today = new Date();
        today.setHours(23,59,59,999);
        const vencimento = parc.vencimento;
        vencimento.setHours(23,59,59,999);
        let value = 0;
        switch (true) {
          case vencimento.getTime() <= today.getTime():
            value = parc.parcela;
            break;
          default:
            value = parc.amortizacao;
            break;
        }
        return soma + value
      },0)
    this.presentValue$.set(valueToday);
  }

  get dateFormats() {
    return DateFormats;
  }

  get operation() {
    return Operation;
  }

  pagar(id: string, parc: Installment) {

  }

  quitar(id: string) {

  }

  fechar(): void {
    this.dialogRef.close();
  }
}
