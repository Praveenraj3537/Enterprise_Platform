import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicIotplusHelpBarComponent } from './dynamic-iotplus-help-bar.component';

describe('DynamicIotplusHelpBarComponent', () => {
  let component: DynamicIotplusHelpBarComponent;
  let fixture: ComponentFixture<DynamicIotplusHelpBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicIotplusHelpBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicIotplusHelpBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
