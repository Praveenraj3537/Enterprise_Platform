import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicSalescrmHelpBarComponent } from './dynamic-salescrm-help-bar.component';

describe('DynamicSalescrmHelpBarComponent', () => {
  let component: DynamicSalescrmHelpBarComponent;
  let fixture: ComponentFixture<DynamicSalescrmHelpBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicSalescrmHelpBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicSalescrmHelpBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
