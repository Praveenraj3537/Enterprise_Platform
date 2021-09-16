import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicTabIndexComponent } from './dynamic-tab-index.component';

describe('DynamicTabIndexComponent', () => {
  let component: DynamicTabIndexComponent;
  let fixture: ComponentFixture<DynamicTabIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicTabIndexComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicTabIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
