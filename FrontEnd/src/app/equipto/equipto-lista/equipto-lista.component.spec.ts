import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalListaComponent } from './local-lista.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LocalListaComponent', () => {
  let component: LocalListaComponent;
  let fixture: ComponentFixture<LocalListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LocalListaComponent],
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        NoopAnimationsModule
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LocalListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });
});
