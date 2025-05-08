import { TestBed } from '@angular/core/testing';

import { LocalTimerService } from './local-timer.service';

describe('LocalTimerService', () => {
  let service: LocalTimerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalTimerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
