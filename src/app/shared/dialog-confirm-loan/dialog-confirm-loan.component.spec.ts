import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogConfirmLoanComponent } from './dialog-confirm-loan.component';

describe('DialogConfirmLoanComponent', () => {
  let component: DialogConfirmLoanComponent;
  let fixture: ComponentFixture<DialogConfirmLoanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogConfirmLoanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogConfirmLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
