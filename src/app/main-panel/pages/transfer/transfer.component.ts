import { Component } from '@angular/core';
import { OperationTypeComponent } from "./components/operation-type/operation-type.component";
import { OperationFormComponent } from './components/operation-form/operation-form.component';

@Component({
  selector: 'app-transfer',
  imports: [OperationTypeComponent, OperationFormComponent],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.css'
})
export class TransferComponent {}
