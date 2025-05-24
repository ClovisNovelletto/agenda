// src/app/add-aluno-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-aluno-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Novo Aluno</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>Nome</mat-label>
        <input matInput formControlName="nome" />
      </mat-form-field>

      <mat-form-field appearance="fill" class="w-full">
        <mat-label>Telefone</mat-label>
        <input matInput formControlName="telefone" />
      </mat-form-field>

      <div class="flex justify-end mt-4">
        <button mat-button (click)="cancelar()">Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Salvar</button>
      </div>
    </form>
  `,
  styles: [`
    .w-full { width: 100%; }
    .mt-4 { margin-top: 1rem; }
    .flex { display: flex; }
    .justify-end { justify-content: flex-end; }
  `]
})
export class AddAlunoDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddAlunoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nomeParcial: string }
  ) {
    this.form = this.fb.group({
      nome: [data.nomeParcial || '', Validators.required],
      telefone: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
