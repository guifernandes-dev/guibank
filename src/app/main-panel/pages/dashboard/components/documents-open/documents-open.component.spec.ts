import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsOpenComponent } from './documents-open.component';

describe('DocumentsOpenComponent', () => {
  let component: DocumentsOpenComponent;
  let fixture: ComponentFixture<DocumentsOpenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsOpenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentsOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
