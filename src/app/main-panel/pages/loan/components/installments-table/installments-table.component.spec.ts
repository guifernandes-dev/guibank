import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentsTableComponent } from './installments-table.component';

describe('InstallmentsTableComponent', () => {
  let component: InstallmentsTableComponent;
  let fixture: ComponentFixture<InstallmentsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallmentsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallmentsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
