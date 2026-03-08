import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPayLoanResumeComponent } from './dialog-pay-loan-resume.component';

describe('DialogPayLoanResumeComponent', () => {
  let component: DialogPayLoanResumeComponent;
  let fixture: ComponentFixture<DialogPayLoanResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogPayLoanResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogPayLoanResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
