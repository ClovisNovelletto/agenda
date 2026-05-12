import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import type { AlunoTreino } from '../../../models/alunoTreino.model';
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
import { ConfigAgenda } from '../../../models/configAgenda.model';
import { map } from 'rxjs/operators';
import { FormArray, FormControl } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { startWith } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { AlunoTreinoService } from '../../../services/alunoTreino.service';

@Component({
  selector: 'app-alunoTreino-form',
  imports: [MatInputModule, MatNativeDateModule, MatSlideToggleModule, CommonModule, MatCheckboxModule,
            ReactiveFormsModule, MatFormFieldModule, MatInputModule,  MatSlideToggleModule, MatOptionModule, MatSelectModule,
            MatButtonModule, MatDialogModule, MatIconModule, MatToolbarModule, MatDatepickerModule, MatFormField, MatAutocompleteModule], // Adicione o RouterModule aqui]
  templateUrl: './alunoTreino-form.component.html',
  styleUrls: ['./alunoTreino-form.component.css'],
})
export class AlunoTreinoFormComponent implements OnInit {
  form!: FormGroup;
  alunos: any[] = [];
  alunoCtrl = new FormControl('');
  alunosFiltrados: any[] = [];
  alunoSelecionado: any = null;
  alunoEncontrado: boolean = true;

  treinos: any[] = [];
  treinoCtrl = new FormControl('');
  treinosFiltrados: any[] = [];
  treinoSelecionado: any = null;
  treinoEncontrado: boolean = true;

  constructor(
    private fb: FormBuilder, private alunoTreinoService: AlunoTreinoService,
    private dialogRef: MatDialogRef<AlunoTreinoFormComponent>,
    private http: HttpClient, private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public  data: any 
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      alunoid: ['', Validators.required],
      treinoid: [null, Validators.required],
      dataini: [null, Validators.required],
      datafim: [null],
      ativo: [true, Validators.required],
    });

    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    forkJoin({
      alunos: this.http.get<any[]>(`${environment.apiUrl}/aluno/alunos`, { headers }),
      treinos: this.http.get<any[]>(`${environment.apiUrl}/treino/treinoLista`, { headers }),
    }).subscribe(({ alunos, treinos  }) => {
      this.alunos = alunos,
      this.treinos = treinos;
console.log("this.alunos", this.alunos)
console.log("this.treinos", this.treinos)
      // --- Inicializa autocomplete ---
      this.setupAlunoAutocomplete();
      this.setupTreinoAutocomplete();

console.log("this.data", this.data)
      // inclusão
      if (this.data?.alunoid) {
        const alunoSelecionado = this.alunos.find(l => l.id === this.data.alunoid);
        this.alunoSelecionado = alunoSelecionado;

        // Preenche IDs no form principal
        this.form.patchValue({
          alunoid: this.data.alunoid,
        });

        // Preenche nomes nos autocompletes
        this.alunoCtrl.setValue(alunoSelecionado?.nome || '');
        //this.treinoCtrl.setValue(treinoSelecionado?.nome || '');

      }

      // alteração
      if (this.data?.alunoTreinos) {
        const alunoSelecionado = this.alunos.find(l => l.id === this.data.alunoTreinos.alunoid);
        this.alunoSelecionado = alunoSelecionado;

        const treinoSelecionado = this.treinos.find(l => l.id === this.data.alunoTreinos.treinoid);
        this.treinoSelecionado = treinoSelecionado;

        // Preenche IDs no form principal
        this.form.patchValue({
          alunoid: this.data.alunoTreinos.alunoid,
          dataini: this.data.alunoTreinos.dataini ? new Date(this.data.alunoTreinos.dataini) : null,
          datafim: this.data.alunoTreinos.datafim ? new Date(this.data.alunoTreinos.datafim) : null,
          treinoid: this.data.alunoTreinos.treinoid,
          ativo: this.data.alunoTreinos.ativo,
        });

        // Preenche nomes nos autocompletes
        this.alunoCtrl.setValue(alunoSelecionado?.nome || '');
        this.treinoCtrl.setValue(treinoSelecionado?.treino || '');

      }

      // --- Marcar campos como dirty para habilitar botão salvar ---
      this.form.markAllAsTouched();
      //this.form.markAsDirty();

      // --- Gatilho de detecção de mudança ---
      setTimeout(() => this.cd.markForCheck());
    });
  }

  setupAlunoAutocomplete() {
    console.log("setupAlunoAutocomplete")
    // inicializa o FormControl se ainda não tiver sido criado
    console.log("this.alunoCtrl",this.alunoCtrl)
    if (!this.alunoCtrl) {
      //this.alunoCtrl = new FormControl('');
      this.alunoCtrl = new FormControl(this.alunoSelecionado?.nome);
    }
console.log("this.alunoCtrl",this.alunoCtrl)
    this.alunoCtrl.valueChanges
      .pipe(
        startWith(''),
        map(value => value?.toLowerCase()),
        map(nome => {
          const filtrado = this.alunos.filter(l =>
            l.nome.toLowerCase().includes(nome)
          );
          this.alunoEncontrado = filtrado.length > 0;
          return filtrado;
        })
      )
      .subscribe(result => {
        this.alunosFiltrados = result;
      });
console.log("this.alunosFiltrados",this.alunosFiltrados)      
  }

  setupTreinoAutocomplete() {
    console.log("setupTreinoAutocomplete")
    // inicializa o FormControl se ainda não tiver sido criado
    console.log("this.treinoCtrl",this.treinoCtrl)
    if (!this.treinoCtrl) {
      this.treinoCtrl = new FormControl(this.treinoSelecionado?.treino);
    }
console.log("this.treinoCtrl",this.treinoCtrl)
    this.treinoCtrl.valueChanges
      .pipe(
        startWith(''),
        map(value => value?.toLowerCase()),
        map(treino => {
          const filtrado = this.treinos.filter(l =>
            l.treino.toLowerCase().includes(treino)
          );
          this.treinoEncontrado = filtrado.length > 0;
          return filtrado;
        })
      )
      .subscribe(result => {
        this.treinosFiltrados = result;
      });
console.log("this.treinosFiltrados",this.treinosFiltrados)      
  }

  salvar() {
    if (this.form.valid) {
      const formValue = this.form.value;

      const updated: any = {
        id: this.data?.alunoTreinos?.id ?? null,
        treinoid: formValue.treinoid,
        dataini: formValue.dataini,
        datafim: formValue.datafim,
        alunoid: this.alunoSelecionado?.id,
        ativo: formValue.ativo,
      };

      console.log('updated:', updated);
      this.dialogRef.close(updated);
    }
  }
  
  fechar() {
    this.dialogRef.close();
  }

  onAlunoSelecionado(event: MatAutocompleteSelectedEvent) {
    console.log("onAlunoSelecionado")
    const nomeSelecionado = event.option.value;
    const aluno = this.alunos.find(l => l.nome === nomeSelecionado);
    console.log('Aluno Selecionado pelo clique:', aluno);
    if (aluno && aluno.id) {
      this.alunoCtrl.setValue(aluno.nome);
      this.form.get('alunoid')?.setValue(aluno.id);

      // Só marca como alterado se for válido
      this.form.get('alunoid')?.markAsDirty();
      this.form.get('alunoid')?.markAsTouched();
      this.form.get('alunoid')?.updateValueAndValidity();

      this.form.markAsDirty();
      this.form.updateValueAndValidity();
    } else {
      // Se limpou o campo, zera e revalida para desabilitar botão
      this.form.get('alunoid')?.reset();
      this.form.get('alunoid')?.updateValueAndValidity();
      this.form.updateValueAndValidity();
    }
  }


  onAlunoBlur() {
    console.log("onAlunoBlur")
    const nome = this.alunoCtrl.value;
    const aluno = this.alunos.find(l => l.nome === nome);
    console.log('Aluno Selecionado ao sair do campo:', aluno);
    if (aluno && aluno.id) {
      this.alunoCtrl.setValue(aluno.nome);
      this.form.get('alunoid')?.setValue(aluno.id);
      this.alunoSelecionado = aluno;

      // Só marca como alterado se for válido
      this.form.get('alunoid')?.markAsDirty();
      this.form.get('alunoid')?.markAsTouched();
      this.form.get('alunoid')?.updateValueAndValidity();

      this.form.markAsDirty();
      this.form.updateValueAndValidity();
    } else {
      // Se limpou o campo, zera e revalida para desabilitar botão
      this.form.get('alunoid')?.reset();
      this.form.get('alunoid')?.updateValueAndValidity();
      this.form.updateValueAndValidity();
    }
  }


  onAlunoSelected(nome: string) {
    console.log("onAlunoSelected")
    console.log('onAlunoSelected...');
    const aluno = this.alunos.find(a => a.nome === nome);
    if (aluno) {
      console.log('alunoid: ', aluno.id);
      this.form.patchValue({ alunoid: aluno.id });
      this.alunoSelecionado = aluno;
      console.log('alunoSelecionado: ', this.alunoSelecionado);
      this.alunoCtrl.markAsDirty();
      this.alunoCtrl.markAsTouched();
    } else {
      this.form.patchValue({ alunoid: '' });
    }
  }
   
  
  onTreinoSelecionado(event: MatAutocompleteSelectedEvent) {
    console.log("onTreinoSelecionado")
    const nomeSelecionado = event.option.value;
    const treino = this.treinos.find(l => l.nome === nomeSelecionado);
    console.log('Treino Selecionado pelo clique:', treino);
    if (treino && treino.id) {
      this.treinoCtrl.setValue(treino.nome);
      this.form.get('Treinoid')?.setValue(treino.id);

      // Só marca como alterado se for válido
      this.form.get('Treinoid')?.markAsDirty();
      this.form.get('Treinoid')?.markAsTouched();
      this.form.get('Treinoid')?.updateValueAndValidity();

      this.form.markAsDirty();
      this.form.updateValueAndValidity();
    } else {
      // Se limpou o campo, zera e revalida para desabilitar botão
      this.form.get('Treinoid')?.reset();
      this.form.get('Treinoid')?.updateValueAndValidity();
      this.form.updateValueAndValidity();
    }
  }


  onTreinoBlur() {
    console.log("onTreinoBlur")
    const nome = this.treinoCtrl.value;
    const treino = this.treinos.find(l => l.treino === nome);
    console.log('Treino Selecionado ao sair do campo:', treino);
    if (treino && treino.id) {
      this.alunoCtrl.setValue(treino.treino);
      this.form.get('alunoid')?.setValue(treino.id);
      this.alunoSelecionado = treino;

      // Só marca como alterado se for válido
      this.form.get('alunoid')?.markAsDirty();
      this.form.get('alunoid')?.markAsTouched();
      this.form.get('alunoid')?.updateValueAndValidity();

      this.form.markAsDirty();
      this.form.updateValueAndValidity();
    } else {
      // Se limpou o campo, zera e revalida para desabilitar botão
      this.form.get('treinoid')?.reset();
      this.form.get('treinoid')?.updateValueAndValidity();
      this.form.updateValueAndValidity();
    }
  }


  onTreinoSelected(nome: string) {
    console.log("onTreinoSelected")
    console.log('onTreinoSelected...');
    const treino = this.treinos.find(a => a.nome === nome);
    if (treino) {
      console.log('treinoid: ', treino.id);
      this.form.patchValue({ treinoid: treino.id });
      this.treinoSelecionado = treino;
      console.log('treinoSelecionado: ', this.treinoSelecionado);
      this.treinoCtrl.markAsDirty();
      this.treinoCtrl.markAsTouched();
    } else {
      this.form.patchValue({ treinoid: '' });
    }
  }

}