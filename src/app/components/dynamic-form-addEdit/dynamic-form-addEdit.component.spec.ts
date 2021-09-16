import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormAddEditComponent } from './dynamic-form-addEdit.component';

describe('DynamicFormComponent', () => {
  let component: DynamicFormAddEditComponent;
  let fixture: ComponentFixture<DynamicFormAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicFormAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicFormAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
