import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanResumeComponent } from './loan-resume.component';

describe('LoanResumeComponent', () => {
  let component: LoanResumeComponent;
  let fixture: ComponentFixture<LoanResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
