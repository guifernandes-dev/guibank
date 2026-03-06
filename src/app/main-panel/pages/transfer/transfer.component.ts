import { Component } from '@angular/core';
import { OperationTypeComponent } from "./components/operation-type/operation-type.component";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-transfer',
  imports: [OperationTypeComponent, RouterModule],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.css'
})
export class TransferComponent {}
