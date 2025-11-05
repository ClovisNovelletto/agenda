import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import type { TabelaPreco } from '../../models/tabelaPreco.model';
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
import { Personal } from '../../models/personal.model';
import { PersonalService } from '../../services/personal.service';
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

@Component({
  selector: 'app-tabelaPreco-form',
  imports: [MatInputModule, MatNativeDateModule, MatSlideToggleModule, CommonModule, MatCheckboxModule,
            ReactiveFormsModule, MatFormFieldModule, MatInputModule,  MatSlideToggleModule, MatOptionModule, MatSelectModule,
            MatButtonModule, MatDialogModule, MatIconModule, MatToolbarModule, MatDatepickerModule, MatFormField, MatAutocompleteModule], // Adicione o RouterModule aqui]
  templateUrl: './tabelaPreco-form.component.html',
  styleUrls: ['./tabelaPreco-form.component.css'],
})
export class TabelaPrecoFormComponent implements OnInit {
  form!: FormGroup;
  locals: any[] = [];
  localCtrl = new FormControl('');
  localsFiltrados: any[] = [];
  localSelecionado: any = null;
  localEncontrado: boolean = true;

  servicos: any[] = [];
  servicoCtrl = new FormControl('');
  servicosFiltrados: any[] = [];
  servicoSelecionado: any = null;
  servicoEncontrado: boolean = true;

  personal?:  Personal;

  /*Plano = duração contrato*/
  planos = [
    { id: 1, nome: 'Experimental' },
    { id: 2, nome: 'Avulso' },
    { id: 3, nome: 'Mensal' },
    { id: 4, nome: 'Bimestral' },
    { id: 5, nome: 'Trimestral' },
    { id: 6, nome: 'Quadrimestral' },
    { id: 7, nome: 'Semestral' },
    { id: 8, nome: 'Anual' },
  ];

  /* frequencia = aula por período*/
  frequencias = [
    { id: 1, nome: '1x por Semana' },
    { id: 2, nome: '2x por Semana' },
    { id: 3, nome: '3x por Semana' },
    { id: 4, nome: '4x por Semana' },
    { id: 5, nome: '5x por Semana' },
    { id: 6, nome: '1x por Quinzena' },
    { id: 7, nome: '1x por Mês' },
    { id: 8, nome: '1x por Bimestre' },
    { id: 9, nome: '1x por Trimestre' },
    { id: 10, nome: '1x por Quadrimestre' },
    { id: 11, nome: '1x por Semestre' },
    { id: 12, nome: '1x por Ano' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TabelaPrecoFormComponent>,
    private personalService: PersonalService,
    private http: HttpClient, private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public  data: any 
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      planoid: [null, Validators.required],
      frequenciaid: [null, Validators.required],
      valor: [null, Validators.required],
      servicoid: [null, Validators.required],
      localid: [null],
      ativo: [true],
    });

    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    forkJoin({
      locals: this.http.get<any[]>(`${environment.apiUrl}/local/locals`, { headers }),
      servicos: this.http.get<any[]>(`${environment.apiUrl}/servico/servicos`, { headers }),
    }).subscribe(({ locals, servicos }) => {
      this.locals = locals;
      this.servicos = servicos;
      
      // --- Inicializa autocomplete ---
      this.setupLocalAutocomplete();
      this.setupServicoAutocomplete();

      if (this.data?.tabelaPreco) {
        const localSelecionado = this.locals.find(l => l.id === this.data.tabelaPreco.localid);
        const servicoSelecionado = this.servicos.find(s => s.id === this.data.tabelaPreco.servicoid);

        this.localSelecionado = localSelecionado;
        this.servicoSelecionado = servicoSelecionado;

        // Preenche IDs no form principal
        console.log("this.data.tabelaPreco.valor", this.data.tabelaPreco.valor);
        this.form.patchValue({
          planoid: this.data.tabelaPreco.planoid,
          frequenciaid: this.data.tabelaPreco.frequenciaid,
          localid: localSelecionado?.id,
          servicoid: servicoSelecionado?.id,
          valor: this.data.tabelaPreco.valor,
          ativo: this.data.tabelaPreco.ativo,
        });

        // Preenche nomes nos autocompletes
        this.localCtrl.setValue(localSelecionado?.nome || '');
        this.servicoCtrl.setValue(servicoSelecionado?.nome || '');

      }
      else {
        if(servicos.length>0) {
          const nomeSelecionado = this.servicos[0].nome;
          const servico = this.servicos.find(l => l.nome === nomeSelecionado);
          if (servico && servico.id) {
            this.servicoCtrl.setValue(servico.nome);
            this.form.get('servicoid')?.setValue(servico.id);
            this.servicoSelecionado = servico;
            this.form.get('servicoid')?.setValue(servico.id);
            this.form.get('servicoid')?.markAsDirty();
            this.form.get('servicoid')?.markAsTouched();
            this.form.get('servicoid')?.updateValueAndValidity();
            this.form.markAsDirty();
            this.form.updateValueAndValidity();
          }
        }  
      }

      // --- Marcar campos como dirty para habilitar botão salvar ---
      this.form.markAllAsTouched();
      //this.form.markAsDirty();

      // --- Gatilho de detecção de mudança ---
      setTimeout(() => this.cd.markForCheck());
    });
  }

  setupLocalAutocomplete() {
    // inicializa o FormControl se ainda não tiver sido criado
    if (!this.localCtrl) {
      //this.localCtrl = new FormControl('');
      this.localCtrl = new FormControl(this.localSelecionado?.nome);
    }

    this.localCtrl.valueChanges
      .pipe(
        startWith(''),
        map(value => value?.toLowerCase()),
        map(nome => {
          const filtrado = this.locals.filter(l =>
            l.nome.toLowerCase().includes(nome)
          );
          this.localEncontrado = filtrado.length > 0;
          return filtrado;
        })
      )
      .subscribe(result => {
        this.localsFiltrados = result;
      });
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

  salvar() {
    if (this.form.valid) {
      const formValue = this.form.value;

      const updated: any = {
        id: this.data?.tabelaPreco?.id ?? null,
        planoid: formValue.planoid,
        frequenciaid: formValue.frequenciaid,
        localid: this.localSelecionado?.id,
        servicoid: this.servicoSelecionado?.id,
        valor: formValue.valor,
        ativo: formValue.ativo,
      };

      const diasAulaArray = this.form.get('diasAula') as FormArray;

      console.log('updated:', updated);
      this.dialogRef.close(updated);
    }
  }
  
  fechar() {
    this.dialogRef.close();
  }

  onLocalSelecionado(event: MatAutocompleteSelectedEvent) {
  const nomeSelecionado = event.option.value;
  const local = this.locals.find(l => l.nome === nomeSelecionado);
  console.log('Local Selecionado pelo clique:', local);
  if (local && local.id) {
    this.localCtrl.setValue(local.nome);
    this.form.get('localid')?.setValue(local.id);

    // Só marca como alterado se for válido
    this.form.get('localid')?.markAsDirty();
    this.form.get('localid')?.markAsTouched();
    this.form.get('localid')?.updateValueAndValidity();

    this.form.markAsDirty();
    this.form.updateValueAndValidity();
  } else {
    // Se limpou o campo, zera e revalida para desabilitar botão
    this.form.get('localid')?.reset();
    this.form.get('localid')?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }
}


onLocalBlur() {
  const nome = this.localCtrl.value;
  const local = this.locals.find(l => l.nome === nome);
  console.log('Local Selecionado ao sair do campo:', local);
  if (local && local.id) {
    this.localCtrl.setValue(local.nome);
    this.form.get('localid')?.setValue(local.id);
    this.localSelecionado = local;

    // Só marca como alterado se for válido
    this.form.get('localid')?.markAsDirty();
    this.form.get('localid')?.markAsTouched();
    this.form.get('localid')?.updateValueAndValidity();

    this.form.markAsDirty();
    this.form.updateValueAndValidity();
  } else {
    // Se limpou o campo, zera e revalida para desabilitar botão
    this.form.get('localid')?.reset();
    this.form.get('localid')?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }
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

  onLocalSelected(nome: string) {
    console.log('onLocalSelected...');
    const local = this.locals.find(a => a.nome === nome);
    if (local) {
      console.log('localid: ', local.id);
      this.form.patchValue({ localid: local.id });
      this.localSelecionado = local;
      console.log('localSelecionado: ', this.localSelecionado);
      this.localCtrl.markAsDirty();
      this.localCtrl.markAsTouched();
    } else {
      this.form.patchValue({ localid: '' });
    }
  }
    
  onServicoSelected(nome: string) {
    console.log('onServicoSelected...');
    const servico = this.servicos.find(a => a.nome === nome);
    if (servico) {
      console.log('servicoid: ', servico.id);
      this.form.patchValue({ servicoid: servico.id });
      this.servicoSelecionado = servico;
      console.log('servicoSelecionado: ', this.servicoSelecionado);
      this.localCtrl.markAsDirty();
      this.localCtrl.markAsTouched();
    } else {
      this.form.patchValue({ servicoid: '' });
    }
  }

  xxxonValorBlur(event: any) {
    console.log('blur gerou');
    const raw = event.target.value.replace(/[^\d,.-]/g, '').replace(',', '.');
    console.log('raw: ', raw);
    const num = parseFloat(raw);
    console.log('num: ', num);
    this.form.get('valor')?.setValue(isNaN(num) ? null : num);
  }

  onValorBlur() {
    const control = this.form.get('valor');
    const valor = control?.value;

    if (valor !== null && valor !== undefined && valor !== '') {
      // força duas casas
      control?.setValue(parseFloat(valor).toFixed(2));
    }
  }

  xxxformatarMoeda(valor: any) {
    console.log('valor gerou: ', valor);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(valor || 0);
  }

}
