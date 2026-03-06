import { CanActivateFn } from '@angular/router';
import { OperationService } from '../../main-panel/pages/transfer/services/operation.service';
import { inject } from '@angular/core';
import { Operation } from '../../../server/constants/db.enum';

export const operationGuard: CanActivateFn = (route, state) => {
  const operationService = inject(OperationService);
  const path = route.routeConfig?.path;
  if (path) {
    const menuItem = operationService.operationMenu
      .find(item => item.operation === path);
    if (menuItem) operationService.currentOp$.set(menuItem);
  }
  return true;
};
