import { TestBed, inject } from '@angular/core/testing';

import { RegisterValidationService } from './register-validation.service';

describe('ResgisterValidationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RegisterValidationService]
    });
  });

  it('should be created', inject([RegisterValidationService], (service: RegisterValidationService) => {
    expect(service).toBeTruthy();
  }));
});
