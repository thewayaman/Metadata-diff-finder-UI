import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiffCompareComponent } from './diff-compare.component';

describe('CatalogLineageComponent', () => {
  let component: DiffCompareComponent;
  let fixture: ComponentFixture<DiffCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiffCompareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiffCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
