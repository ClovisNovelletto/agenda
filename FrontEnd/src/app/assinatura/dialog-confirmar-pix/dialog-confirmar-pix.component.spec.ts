import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogConfirmarPixComponent } from './dialog-confirmar-pix.component';

describe('DialogConfirmarPixComponent', () => {
  let component: DialogConfirmarPixComponent;
  let fixture: ComponentFixture<DialogConfirmarPixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogConfirmarPixComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogConfirmarPixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
