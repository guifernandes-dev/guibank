import { Component, inject } from '@angular/core';
import { TransferService } from './services/transfer.service';

@Component({
  selector: 'app-transfer',
  imports: [],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.css'
})
export class TransferComponent {
  private transferService = inject(TransferService);
  get operations() {
    return this.transferService.operations;
  }
}
