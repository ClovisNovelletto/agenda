import { TestBed } from '@angular/core/testing';

import { AgendaStatusService } from './agenda-status.service';

describe('AgendaStatusService', () => {
  let service: AgendaStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgendaStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
