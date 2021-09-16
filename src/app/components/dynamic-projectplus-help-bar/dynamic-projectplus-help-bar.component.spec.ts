import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicProjectplusHelpBarComponent } from './dynamic-projectplus-help-bar.component';

describe('DynamicProjectplusHelpBarComponent', () => {
  let component: DynamicProjectplusHelpBarComponent;
  let fixture: ComponentFixture<DynamicProjectplusHelpBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicProjectplusHelpBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicProjectplusHelpBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
