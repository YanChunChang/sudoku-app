import { TestBed } from '@angular/core/testing';

import { GameConfigService } from './gameconfig.service';

describe('GameconfigService', () => {
  let service: GameConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
