import { Component, inject } from '@angular/core';
import { OperationService } from '../../services/operation.service';
import { Operation } from '../../../../../../server/constants/data.enum';
import { MenuOperation } from '../../models/operation.models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-operation-type',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './operation-type.component.html',
  styleUrl: './operation-type.component.css'
})
export class OperationTypeComponent {
  private operationService = inject(OperationService);

  get operationItems() {
    return this.operationService.operationMenu;
  }

  disabledBtn(operation: Operation): boolean {
    return this.operationService.currentOp.operation === operation;
  }

  changeOperation(operation: MenuOperation) {
    this.operationService.currentOp = operation;
    this.operationService.buildForm(operation);
    this.operationService.updateErros('destino');
    this.operationService.updateErros('valor');
    this.operationService.updateErros('vencimento');
  }
}
