import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { startWith } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TreinoService } from '../../services/treino.service';

@Component({
  selector: 'app-treino-form',
  imports: [MatInputModule, MatNativeDateModule, MatSlideToggleModule, CommonModule, MatCheckboxModule,
            ReactiveFormsModule, MatFormFieldModule, MatInputModule,  MatSlideToggleModule, MatOptionModule, MatSelectModule,
            MatButtonModule, MatDialogModule, MatIconModule, MatToolbarModule, MatDatepickerModule, MatFormField, MatAutocompleteModule], // Adicione o RouterModule aqui]
  templateUrl: './treinoItem-form.component.html',
  styleUrl: './treinoItem-form.component.css'
})
export class TreinoItemFormComponent implements OnInit {
  form!: FormGroup;
  treinos: any[] = [];
  treinoCtrl = new FormControl('');
  treinosFiltrados: any[] = [];
  treinoSelecionado: any = null;
  treinoEncontrado: boolean = true;

  constructor(
    private fb: FormBuilder, private treinoService: TreinoService,
    private dialogRef: MatDialogRef<TreinoItemFormComponent>,
    private http: HttpClient, private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public  data: any, 
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      treinoid: [Validators.required],
      exercicio: [null, Validators.required],
      serie: [null],
      repeticao: [null],
      tempo: [null],
      peso: [null],
    });
    //this.form.get('valorreceber')?.disable();

    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    forkJoin({
      treinos: this.http.get<any[]>(`${environment.apiUrl}/treino/treinoLista`, { headers }),
    }).subscribe(({ treinos  }) => {
      this.treinos = treinos;
console.log("this.treinos", this.treinos)
      // --- Inicializa autocomplete ---
      this.setupTreinoAutocomplete();
      if (this.data?.treinoid) {
        const treinoSelecionado = this.treinos.find(l => l.id === this.data.treinoid);
      
        console.log("treinoSelecionado", treinoSelecionado)
        this.treinoSelecionado = treinoSelecionado;
        this.form.patchValue({
          treinoid: this.data.treinoid
        });   
        // Preenche nomes nos autocompletes
        this.treinoCtrl.setValue(treinoSelecionado?.descricao || '');
      }
console.log("this.data", this.data)
      if (this.data?.treinoItems) {
        const treinoSelecionado = this.treinos.find(l => l.id === this.data.treinoItems.treinoid);
//        const treinoSelecionado = this.treinos.find(l => l.id === this.data.treinoid);
//console.log("treinoSelecionado", treinoSelecionado)
//        this.treinoSelecionado = treinoSelecionado;

        // Preenche IDs no form principal
        this.form.patchValue({
          treinoid: this.data.treinoItems.treinoid,
          exercicio: this.data.treinoItems.exercicio,
          serie: this.data.treinoItems.serie,
          repeticao: this.data.treinoItems.repeticao,
          tempo: this.data.treinoItems.tempo,
          peso: this.data.treinoItems.peso,
          ordem: this.data.treinoItems.ordem,
        });

        // Preenche nomes nos autocompletes
        this.treinoCtrl.setValue(treinoSelecionado?.descricao || '');

      }

      // --- Marcar campos como dirty para habilitar botão salvar ---
      this.form.markAllAsTouched();
      //this.form.markAsDirty();

      // --- Gatilho de detecção de mudança ---
      setTimeout(() => this.cd.markForCheck());
    });
  }

  setupTreinoAutocomplete() {
    // inicializa o FormControl se ainda não tiver sido criado
    if (!this.treinoCtrl) {
      //this.treinoCtrl = new FormControl('');
      this.treinoCtrl = new FormControl(this.treinoSelecionado?.descricao);
    }

    this.treinoCtrl.valueChanges
      .pipe(
        startWith(''),
        map(value => value?.toLowerCase()),
        map(descricao => {
          const filtrado = this.treinos.filter(l =>
            l.descricao.toLowerCase().includes(descricao)
          );
          this.treinoEncontrado = filtrado.length > 0;
          return filtrado;
        })
      )
      .subscribe(result => {
        this.treinosFiltrados = result;
      });
  }

  salvar() {
    if (this.form.valid) {
      const formValue = this.form.value;

      const updated: any = {
        id: this.data?.treinoItems?.id ?? null,
        treinoid: this.treinoSelecionado?.id,
        exercicio: formValue.exercicio,
        serie: formValue.serie,
        repeticao: formValue.repeticao,
        tempo: formValue.tempo,
        peso: formValue.peso,
        ordem: formValue.ordem,
      };

      console.log('updated:', updated);
      this.dialogRef.close(updated);
    }
  }
  
  fechar() {
    this.dialogRef.close();
  }

  onTreinoSelecionado(event: MatAutocompleteSelectedEvent) {
    const nomeSelecionado = event.option.value;
    const treino = this.treinos.find(l => l.nome === nomeSelecionado);
    console.log('Treino Selecionado pelo clique:', treino);
    if (treino && treino.id) {
      this.treinoCtrl.setValue(treino.nome);
      this.form.get('alunoid')?.setValue(treino.id);

      // Só marca como alterado se for válido
      this.form.get('treinoid')?.markAsDirty();
      this.form.get('treinoid')?.markAsTouched();
      this.form.get('treinoid')?.updateValueAndValidity();

      this.form.markAsDirty();
      this.form.updateValueAndValidity();
    } else {
      // Se limpou o campo, zera e revalida para desabilitar botão
      this.form.get('treinoid')?.reset();
      this.form.get('treinoid')?.updateValueAndValidity();
      this.form.updateValueAndValidity();
    }
  }


  onTreinoBlur() {
    const nome = this.treinoCtrl.value;
    const treino = this.treinos.find(l => l.descricao === nome);
    console.log('Treino Selecionado ao sair do campo:', treino);
    if (treino && treino.id) {
      this.treinoCtrl.setValue(treino.descricao);
      this.form.get('alunoid')?.setValue(treino.id);
      this.treinoSelecionado = treino;

      // Só marca como alterado se for válido
      this.form.get('treinoid')?.markAsDirty();
      this.form.get('treinoid')?.markAsTouched();
      this.form.get('treinoid')?.updateValueAndValidity();

      this.form.markAsDirty();
      this.form.updateValueAndValidity();
    } else {
      // Se limpou o campo, zera e revalida para desabilitar botão
      this.form.get('treinoid')?.reset();
      this.form.get('treinoid')?.updateValueAndValidity();
      this.form.updateValueAndValidity();
    }
  }


  onAlunoSelected(nome: string) {
    console.log('onAlunoSelected...');
    const treino = this.treinos.find(a => a.descricao === nome);
    if (treino) {
      console.log('treinoid: ', treino.id);
      this.form.patchValue({treinoid: treino.id });
      this.treinoSelecionado = treino;
      console.log('treinoSelecionado: ', this.treinoSelecionado);
      this.treinoCtrl.markAsDirty();
      this.treinoCtrl.markAsTouched();
    } else {
      this.form.patchValue({ treinoid: '' });
    }
  }
   

   onValorBlur() {

    const control_valorRec = this.form.get('valor');
    const valorRec = control_valorRec?.value;
    if (valorRec !== null && valorRec !== undefined && valorRec !== '') {
      // força duas casas
      control_valorRec?.setValue(parseFloat(valorRec).toFixed(2));
    }

  }

}