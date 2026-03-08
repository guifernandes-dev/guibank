import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansOpenComponent } from './loans-open.component';

describe('LoansOpenComponent', () => {
  let component: LoansOpenComponent;
  let fixture: ComponentFixture<LoansOpenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoansOpenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoansOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
