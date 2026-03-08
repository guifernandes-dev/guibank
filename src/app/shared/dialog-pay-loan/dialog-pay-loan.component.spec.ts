import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPayLoanComponent } from './dialog-pay-loan.component';

describe('DialogPayLoanComponent', () => {
  let component: DialogPayLoanComponent;
  let fixture: ComponentFixture<DialogPayLoanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogPayLoanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogPayLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
