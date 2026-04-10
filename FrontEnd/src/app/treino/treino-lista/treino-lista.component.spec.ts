import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreinoListaComponent } from './treino-lista.component';

describe('TreinoListaComponent', () => {
  let component: TreinoListaComponent;
  let fixture: ComponentFixture<TreinoListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreinoListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreinoListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
