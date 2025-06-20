import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import type { Aluno } from '../../models/aluno.model';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MatDatepickerModule } from '@angular/material/datepicker';

import { MatFormField } from '@angular/material/form-field';

@Component({
  selector: 'app-aluno-form',
  imports: [MatInputModule, MatNativeDateModule, MatSlideToggleModule, CommonModule,
            ReactiveFormsModule, MatFormFieldModule, MatInputModule,  MatSlideToggleModule,
            MatButtonModule, MatDialogModule, MatIconModule, MatToolbarModule, MatDatepickerModule, MatFormField], // Adicione o RouterModule aqui]
  templateUrl: './aluno-form.component.html'
})
export class AlunoFormComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AlunoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public  data: any // { aluno?: Aluno }//data: Aluno 
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      nome: ['', Validators.required],
      telefone: ['', Validators.required],
      ativo: [true],
      email: [''],
      cpf: [''],
      datanasc: [null],
    });

    
    if (this.data?.aluno) {
      console.log('this.data.aluno: ', this.data.aluno);
      this.form.patchValue({
        nome: this.data.aluno.nome,
        telefone: this.data.aluno.telefone,
        ativo: this.data.aluno.ativo,
        email: this.data.aluno.email,
        cpf: this.data.aluno.cpf,
        datanasc: this.data.aluno.datanasc
          ? new Date(this.data.aluno.datanasc)
          : null
      });
    }
  }

  salvar() {
    if (this.form.valid) {
      const updated: Aluno = {
        id: this.data?.aluno?.id ?? null,
        ...this.form.value
      };
      this.dialogRef.close(updated);
    }
  }

  fechar() {
    this.dialogRef.close();
  }
}
