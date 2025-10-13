import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import type { AlunoPlano } from '../../../models/alunoPlano.model';
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
import { RecebGeralService } from '../../../services/recebGeral.service';

@Component({
  selector: 'app-recebGeral-form',
  imports: [MatInputModule, MatNativeDateModule, MatSlideToggleModule, CommonModule, MatCheckboxModule,
            ReactiveFormsModule, MatFormFieldModule, MatInputModule,  MatSlideToggleModule, MatOptionModule, MatSelectModule,
            MatButtonModule, MatDialogModule, MatIconModule, MatToolbarModule, MatDatepickerModule, MatFormField, MatAutocompleteModule], // Adicione o RouterModule aqui]
  templateUrl: './recebGeral-form.component.html',
  styleUrls: ['./recebGeral-form.component.css'],
})
export class RecebGeralFormComponent implements OnInit {
  form!: FormGroup;
  alunos: any[] = [];
  alunoCtrl = new FormControl('');
  alunosFiltrados: any[] = [];
  alunoSelecionado: any = null;
  alunoEncontrado: boolean = true;

  /*status */
  status =[
    { id: 1, nome: 'Não Recebido'},
    { id: 2, nome: 'Recebido'},
    { id: 3, nome: 'Renegociado'},
    { id: 4, nome: 'Cancelado'},
  ]

  /*forma pagamento */
  formaspagamento =[
    { id: 1, nome: 'Dinheiro'},
    { id: 2, nome: 'Pix'},
    { id: 3, nome: 'Débito'},
    { id: 4, nome: 'Crédito'},
  ]
  constructor(
    private fb: FormBuilder, private recebGeralService: RecebGeralService,
    private dialogRef: MatDialogRef<RecebGeralFormComponent>,
    private http: HttpClient, private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public  data: any 
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      alunoid: ['', Validators.required],
      datavcto: [null, Validators.required],
      datarcto: [null],
      valor: [null, Validators.required],
      statusid: [1, Validators.required],
      formapagtoid: [1, Validators.required],
    });
    //this.form.get('valorreceber')?.disable();

    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    forkJoin({
      alunos: this.http.get<any[]>(`${environment.apiUrl}/alunos`, { headers }),
    }).subscribe(({ alunos  }) => {
      this.alunos = alunos;

      // --- Inicializa autocomplete ---
      this.setupAlunoAutocomplete();

console.log("this.data", this.data)
      if (this.data?.recebGeral) {
        const alunoSelecionado = this.alunos.find(l => l.id === this.data.recebGeral.alunoid);

        this.alunoSelecionado = alunoSelecionado;

        // Preenche IDs no form principal
        this.form.patchValue({
          alunoid: this.data.recebGeral.alunoid,
          datavcto: this.data.recebGeral.datavcto ? new Date(this.data.recebGeral.datavcto) : null,
          datarcto: this.data.recebGeral.datarcto ? new Date(this.data.recebGeral.datarcto) : null,
          valor: this.data.recebGeral.valor,
          formapagtoid: this.data.recebGeral.formapagtoid,
          statusid: this.data.recebGeral.statusid,
        });

        // Preenche nomes nos autocompletes
        this.alunoCtrl.setValue(alunoSelecionado?.nome || '');

      }

      // --- Marcar campos como dirty para habilitar botão salvar ---
      this.form.markAllAsTouched();
      //this.form.markAsDirty();

      // --- Gatilho de detecção de mudança ---
      setTimeout(() => this.cd.markForCheck());
    });
  }

  setupAlunoAutocomplete() {
    // inicializa o FormControl se ainda não tiver sido criado
    if (!this.alunoCtrl) {
      //this.alunoCtrl = new FormControl('');
      this.alunoCtrl = new FormControl(this.alunoSelecionado?.nome);
    }

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
  }

  salvar() {
    if (this.form.valid) {
      const formValue = this.form.value;

      const updated: any = {
        id: this.data?.recebGeral?.id ?? null,
        alunoid: this.alunoSelecionado?.id,
        datavcto: formValue.datavcto,
        datarcto: formValue.datarcto,
        valor: formValue.valor,
        formapagtoid: formValue.formapagtoid,
        statusid: formValue.statusid,
      };

      console.log('updated:', updated);
      this.dialogRef.close(updated);
    }
  }
  
  fechar() {
    this.dialogRef.close();
  }

  onAlunoSelecionado(event: MatAutocompleteSelectedEvent) {
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
   

   onValorBlur() {

    const control_valorRec = this.form.get('valor');
    const valorRec = control_valorRec?.value;
    if (valorRec !== null && valorRec !== undefined && valorRec !== '') {
      // força duas casas
      control_valorRec?.setValue(parseFloat(valorRec).toFixed(2));
    }

  }

}