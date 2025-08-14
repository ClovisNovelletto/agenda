import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracoesServicosComponent } from './configuracoes-servicos.component';

describe('ConfiguracoesServicosComponent', () => {
  let component: ConfiguracoesServicosComponent;
  let fixture: ComponentFixture<ConfiguracoesServicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracoesServicosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracoesServicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
