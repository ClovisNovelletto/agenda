import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescricaoDialogComponent } from './descricao-dialog.component';

describe('DescricaoDialogComponent', () => {
  let component: DescricaoDialogComponent;
  let fixture: ComponentFixture<DescricaoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescricaoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescricaoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
