import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicChildAssociationComponent } from './dynamic-child-association.component';

describe('DynamicChildAssociationComponent', () => {
  let component: DynamicChildAssociationComponent;
  let fixture: ComponentFixture<DynamicChildAssociationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicChildAssociationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicChildAssociationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
