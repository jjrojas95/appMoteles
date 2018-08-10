import { TestBed, inject } from '@angular/core/testing';

import { RegisterCurrentUserService } from './register-current-user.service';

describe('RegisterCurrentUserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RegisterCurrentUserService]
    });
  });

  it('should be created', inject([RegisterCurrentUserService], (service: RegisterCurrentUserService) => {
    expect(service).toBeTruthy();
  }));
});
