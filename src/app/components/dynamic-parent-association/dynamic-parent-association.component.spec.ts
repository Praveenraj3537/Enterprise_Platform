import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicParentAssociationComponent } from './dynamic-parent-association.component';

describe('DynamicParentAssociationComponent', () => {
  let component: DynamicParentAssociationComponent;
  let fixture: ComponentFixture<DynamicParentAssociationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicParentAssociationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicParentAssociationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
