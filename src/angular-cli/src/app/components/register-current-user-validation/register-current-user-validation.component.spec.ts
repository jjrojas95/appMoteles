import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCurrentUserValidationComponent } from './register-current-user-validation.component';

describe('RegisterCurrentUserValidationComponent', () => {
  let component: RegisterCurrentUserValidationComponent;
  let fixture: ComponentFixture<RegisterCurrentUserValidationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterCurrentUserValidationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterCurrentUserValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
