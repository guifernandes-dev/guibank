import { inject, Pipe, PipeTransform } from '@angular/core';
import { Operation } from '../../server/constants/db.enum';
import { OperationService } from '../main-panel/pages/transfer/services/operation.service';

@Pipe({
  name: 'iconLoan'
})
export class IconLoanPipe implements PipeTransform {
  private readonly operationService = inject(OperationService);

  transform(tipo: Operation): string {
    const menuItem = this.operationService.operationMenu.find(item => tipo === Operation.CREDITO)
    if (tipo && menuItem) {
      return menuItem.icon;
    }
    return '';
  }
}
