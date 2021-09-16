import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormReportsComponent } from './dynamic-form-reports.component';

describe('DynamicFormReportsComponent', () => {
  let component: DynamicFormReportsComponent;
  let fixture: ComponentFixture<DynamicFormReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicFormReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicFormReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
