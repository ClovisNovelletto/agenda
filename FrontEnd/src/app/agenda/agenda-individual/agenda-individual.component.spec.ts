import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaIndividualComponent } from './agenda-individual.component';

describe('AgendaIndividualComponent', () => {
  let component: AgendaIndividualComponent;
  let fixture: ComponentFixture<AgendaIndividualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaIndividualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaIndividualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
