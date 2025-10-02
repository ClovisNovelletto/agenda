import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAlunoDialogComponent } from './add-aluno-dialog.component';

describe('AddAlunoDialogComponent', () => {
  let component: AddAlunoDialogComponent;
  let fixture: ComponentFixture<AddAlunoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAlunoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAlunoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
