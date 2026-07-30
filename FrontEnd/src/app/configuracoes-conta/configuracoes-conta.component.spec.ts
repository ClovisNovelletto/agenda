import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracoesContaComponent } from './configuracoes-conta.component';

describe('ConfiguracoesContaComponent', () => {
  let component: ConfiguracoesContaComponent;
  let fixture: ComponentFixture<ConfiguracoesContaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracoesContaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracoesContaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
