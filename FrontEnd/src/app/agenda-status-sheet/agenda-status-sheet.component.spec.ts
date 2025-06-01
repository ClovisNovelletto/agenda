import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaStatusSheetComponent } from './agenda-status-sheet.component';

describe('AgendaStatusSheetComponent', () => {
  let component: AgendaStatusSheetComponent;
  let fixture: ComponentFixture<AgendaStatusSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaStatusSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaStatusSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
