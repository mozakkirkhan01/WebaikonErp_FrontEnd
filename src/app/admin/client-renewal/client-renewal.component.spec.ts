import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRenewalComponent } from './client-renewal.component';

describe('ClientRenewalComponent', () => {
  let component: ClientRenewalComponent;
  let fixture: ComponentFixture<ClientRenewalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientRenewalComponent]
    });
    fixture = TestBed.createComponent(ClientRenewalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
