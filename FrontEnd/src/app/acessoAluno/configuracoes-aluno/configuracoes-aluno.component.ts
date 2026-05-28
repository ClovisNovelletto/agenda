import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

import { MatOptionModule } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormArray, FormControl } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AddLocalDialogComponent } from '../../agenda/appointment-dialog/add-local-dialog/add-local-dialog.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { startWith } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { AlunoService } from '../../services/aluno.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-aluno-form',
  imports: [MatInputModule, MatNativeDateModule, MatSlideToggleModule, CommonModule, MatCheckboxModule,
            ReactiveFormsModule, MatFormFieldModule, MatInputModule,  MatSlideToggleModule, MatOptionModule, MatSelectModule,
            MatButtonModule, MatDialogModule, MatIconModule, MatToolbarModule, MatDatepickerModule, MatFormField, MatAutocompleteModule], // Adicione o RouterModule aqui]
  templateUrl: './configuracoes-aluno.component.html',
  styleUrls: ['./configuracoes-aluno.component.css'],
})
export class ConfiguracoesAlunoComponent implements OnInit {
  form!: FormGroup;
  //aluno: Aluno[] = [];
  aluno: Aluno | null = null;

  mensagem: string ='';
  intervalo: number = 10; // valor padrão
  horaInicio: number = 6; // valor padrão
  horaFim: number = 22; // valor padrão
  diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  constructor(
    private fb: FormBuilder,
    private alunoService: AlunoService, private snackBar: MatSnackBar,
    private http: HttpClient, private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    //this.getDadosAluno();
    console.log('aluno', this.aluno);
    this.form = this.fb.group({
      nome: ['', Validators.required],
      telefone: ['', Validators.required],
      ativo: [true],
      email: [''],
      cpf: [''],
      datanasc: [null],
      datainicio: [null],
      plano: [null],
      frequencia: [null],
      local: [null, ],
      servico: [null, ],
      diasAula: this.fb.array([])
    });

    forkJoin({
      aluno: this.getDadosAluno(),
    }).subscribe(({ aluno }) => {
      this.aluno = aluno;
      
      if (this.aluno?.id) {


        // Preenche IDs no form principal
        this.form.patchValue({
          nome: this.aluno.nome,
          telefone: this.aluno.telefone,
          ativo: this.aluno.ativo,
          email: this.aluno.email,
          cpf: this.aluno.cpf,
          datanasc: this.aluno.datanasc ? new Date(this.aluno.datanasc) : null,
          datainicio: this.aluno.datainicio ? new Date(this.aluno.datainicio) : null,
          plano: this.aluno.plano,
          frequencia: this.aluno.frequencia,
          local: this.aluno.local,
          servico: this.aluno.servico,
        });
        this.form.get('ativo')?.disable();
        // Dias de aula
        const diasAulaArray = this.form.get('diasAula') as FormArray;

        for (let i = 0; i < 7; i++) {
          diasAulaArray.push(
            this.fb.group({
              ativo: [false],
              hora: ['']
            })
          );
        }

        console.log('diasAulaArray', diasAulaArray)
        for (let i = 0; i < 7; i++) {

          const diaKey = `aludia${i}` as keyof typeof this.aluno;
          const horaKey = `aluhora${i}` as keyof typeof this.aluno;

          const ativo = this.aluno[diaKey] ?? false;
          const hora = this.aluno[horaKey] ?? '';


          const grupo = diasAulaArray.at(i);

          console.log(i, grupo);
          grupo.get('ativo')?.setValue(ativo);
          grupo.get('hora')?.setValue(hora);

          // impede editar o toggle
          grupo.get('ativo')?.disable();

          ativo
            ? grupo.get('hora')?.enable()
            : grupo.get('hora')?.disable();
        }
      }

      // --- Marcar campos como dirty para habilitar botão salvar ---
      this.form.markAllAsTouched();
      //this.form.markAsDirty();

      // --- Gatilho de detecção de mudança ---
      setTimeout(() => this.cd.markForCheck());
    });
  }

  getDadosAluno(): Observable<Aluno> {
    return this.alunoService.getDadosAluno();
  }


  salvar() {
    if (this.form.valid) {
      const formValue = this.form.value;

      const updated: any = {
        id: this.aluno?.id ?? null,
        nome: formValue.nome,
        telefone: formValue.telefone,
        email: formValue.email,
        cpf: formValue.cpf,
        datanasc: formValue.datanasc,
      };

      console.log('updated:', updated);


      this.alunoService.salvarDadosAluno(updated).subscribe({
        next: () => {
          this.mensagem = '✅ Dados salvos com sucesso!';
          this.snackBar.open(this.mensagem, 'Fechar', {
            duration: 5000,
            panelClass: ['snackbar-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.form.markAsPristine();
        },
        error: () => {
          this.mensagem = '❌ Erro ao salvar dados.';
          this.snackBar.open(this.mensagem, 'Fechar', {
            duration: 5000,
            panelClass: ['snackbar-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });

    }
  }
  
  fechar() {
    //this.close();
    window.history.back();
  }

  get diasAulaArray(): FormArray  {
    return this.form.get('diasAula') as FormArray;
  }

}
