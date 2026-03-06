import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { operationGuard } from './operation.guard';

describe('operationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => operationGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
