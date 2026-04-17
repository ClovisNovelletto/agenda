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
  templateUrl: './treino-form.component.html',
  styleUrl: './treino-form.component.css'
})
export class TreinoFormComponent implements OnInit {
  form!: FormGroup;
  //treinos: any[] = [];
  //treinoCtrl = new FormControl('');
  //treinosFiltrados: any[] = [];
  //treinoSelecionado: any = null;
  //treinoEncontrado: boolean = true;

  servicos: any[] = [];
  servicoCtrl = new FormControl('');
  servicosFiltrados: any[] = [];
  servicoSelecionado: any = null;
  servicoEncontrado: boolean = true;

  constructor(
    private fb: FormBuilder, private treinoService: TreinoService,
    private dialogRef: MatDialogRef<TreinoFormComponent>,
    private http: HttpClient, private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public  data: any, 
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      descricao: [null, Validators.required],
      servicoid: [Validators.required],
      ativo: [true],
    });
    //this.form.get('valorreceber')?.disable();

    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    forkJoin({
      servicos: this.http.get<any[]>(`${environment.apiUrl}/servico/servicos`, { headers }),
      treinos: this.http.get<any[]>(`${environment.apiUrl}/treino/treinoLista`, { headers }),
    }).subscribe(({ servicos }) => {
      this.servicos = servicos;

      // --- Inicializa autocomplete ---
      this.setupServicoAutocomplete();

      if (this.data?.treino) {

        const servicoSelecionado = this.servicos.find(s => s.id === this.data.treino.servicoid);
        this.servicoSelecionado = servicoSelecionado;

        // Preenche IDs no form principal
        this.form.patchValue({
          descricao: this.data.treino.descricao,
          servicoid: servicoSelecionado?.id,
          ativo: this.data.treino.ativo,
        });

        // Preenche nomes nos autocompletes
        this.servicoCtrl.setValue(servicoSelecionado?.nome || '');

      }

      // --- Marcar campos como dirty para habilitar botão salvar ---
      this.form.markAllAsTouched();
      //this.form.markAsDirty();

      // --- Gatilho de detecção de mudança ---
      setTimeout(() => this.cd.markForCheck());
    });
  }

  salvar() {
    if (this.form.valid) {
      const formValue = this.form.value;

      const updated: any = {
        id: this.data?.treino?.id ?? null,
        servicoid: this.servicoSelecionado?.id,
        descricao: formValue.descricao,
        ativo: formValue.ativo,
      };

      console.log('updated:', updated);
      this.dialogRef.close(updated);
    }
  }
  
  fechar() {
    this.dialogRef.close();
  }

  onServicoSelecionado(event: MatAutocompleteSelectedEvent) {
  const nomeSelecionado = event.option.value;
  const servico = this.servicos.find(l => l.nome === nomeSelecionado);
  console.log('Serviço Selecionado pelo clique:', servico);
  if (servico && servico.id) {
    this.servicoCtrl.setValue(servico.nome);
    this.form.get('servicoid')?.setValue(servico.id);
    this.servicoSelecionado = servico;

    // Só marca como alterado se for válido
    this.form.get('servicoid')?.markAsDirty();
    this.form.get('servicoid')?.markAsTouched();
    this.form.get('servicoid')?.updateValueAndValidity();

    this.form.markAsDirty();
    this.form.updateValueAndValidity();
  } else {
    // Se limpou o campo, zera e revalida para desabilitar botão
    this.form.get('servicoid')?.reset();
    this.form.get('servicoid')?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }
}


onServicoBlur() {
  const nome = this.servicoCtrl.value;
  const servico = this.servicos.find(l => l.nome === nome);
  console.log('Serviço Selecionado ao sair do campo:', servico);
  if (servico && servico.id) {
    this.servicoCtrl.setValue(servico.nome);
    this.form.get('servicoid')?.setValue(servico.id);

    // Só marca como alterado se for válido
    this.form.get('servicoid')?.markAsDirty();
    this.form.get('servicoid')?.markAsTouched();
    this.form.get('servicoid')?.updateValueAndValidity();

    this.form.markAsDirty();
    this.form.updateValueAndValidity();
  } else {
    // Se limpou o campo, zera e revalida para desabilitar botão
    this.form.get('servicoid')?.reset();
    this.form.get('servicoid')?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }
}


   setupServicoAutocomplete() {
  if (!this.servicoCtrl) {
    this.servicoCtrl = new FormControl('');
  }

  this.servicoCtrl.valueChanges
      .pipe(
        startWith(''),
        map(value => value?.toLowerCase()),
        map(nome => {
          const filtrado = this.servicos.filter(s =>
            s.nome.toLowerCase().includes(nome)
          );
          this.servicoEncontrado = filtrado.length > 0;
          return filtrado;
        })
      )
      .subscribe(result => {
        this.servicosFiltrados = result;
      });
  }
}