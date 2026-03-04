import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogLoanTableComponent } from './dialog-loan-table.component';

describe('DialogLoanTableComponent', () => {
  let component: DialogLoanTableComponent;
  let fixture: ComponentFixture<DialogLoanTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogLoanTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogLoanTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
