import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreinoFormComponent } from './treino-form.component';

describe('TreinoFormComponent', () => {
  let component: TreinoFormComponent;
  let fixture: ComponentFixture<TreinoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreinoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreinoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
