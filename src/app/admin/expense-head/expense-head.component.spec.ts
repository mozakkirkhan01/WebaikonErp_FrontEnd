import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseHeadComponent } from './expense-head.component';

describe('ExpenseHeadComponent', () => {
  let component: ExpenseHeadComponent;
  let fixture: ComponentFixture<ExpenseHeadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseHeadComponent]
    });
    fixture = TestBed.createComponent(ExpenseHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
