import { Component, inject } from '@angular/core';
import { OperationService } from '../../services/operation.service';
import { Operation } from '../../../../../../server/constants/db.enum';
import { MenuOperation } from '../../models/operation.models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from '../../../../../core/login.services/login.service';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-operation-type',
  imports: [MatIconModule, MatButtonModule, RouterModule, TranslatePipe],
  templateUrl: './operation-type.component.html',
  styleUrl: './operation-type.component.css'
})
export class OperationTypeComponent {
  private operationService = inject(OperationService);
  private loginService = inject(LoginService);
  

  get operationItems() {
    return this.operationService.operationMenu;
  }
  
  get destinoNumero() {
    return this.operationService.tipoConta.value === 'num';
  }

  disabledBtn(operation: Operation): boolean {
    return this.operationService.currentOp$().operation === operation;
  }

  changeOperation(operation: MenuOperation) {
    this.operationService.currentOp$.set(operation);
    this.operationService.operationForm.get('destino')?.get('id')?.reset('');
    this.operationService.operationForm.get('destino')?.get('email')?.reset('');
    this.operationService.operationForm.get('destino')?.get('nome')?.reset('');
    this.operationService.buildForm(this.loginService.user());
    this.operationService.updateErros(this.destinoNumero ? 'id' : 'email');
    this.operationService.updateErros('valor');
    this.operationService.updateErros('vencimento');
  }
}
