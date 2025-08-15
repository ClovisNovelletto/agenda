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

import { MatOptionModule } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';
import { Personal } from '../../models/personal.model';
import { PersonalService } from '../../services/personal.service';
import { Observable } from 'rxjs';
import { ConfigAgenda } from '../../models/configAgenda.model';
import { map } from 'rxjs/operators';
import { FormArray, FormControl } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AddLocalDialogComponent } from '../../add-local-dialog/add-local-dialog.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { startWith } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-aluno-form',
  imports: [MatInputModule, MatNativeDateModule, MatSlideToggleModule, CommonModule, MatCheckboxModule,
            ReactiveFormsModule, MatFormFieldModule, MatInputModule,  MatSlideToggleModule, MatOptionModule, MatSelectModule,
            MatButtonModule, MatDialogModule, MatIconModule, MatToolbarModule, MatDatepickerModule, MatFormField, MatAutocompleteModule], // Adicione o RouterModule aqui]
  templateUrl: './aluno-form.component.html',
  styleUrls: ['./aluno-form.component.css'],
})
export class AlunoFormComponent implements OnInit {
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

  horasPossiveis: string[] = [];
  intervalo: number = 10; // valor padrão
  horaInicio: number = 6; // valor padrão
  horaFim: number = 22; // valor padrão
  personal?:  Personal;
  diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  configAgenda: ConfigAgenda = {
    diasAtendimento: [],
    horaInicio: 8,
    horaFim: 18,
    intervaloMinutos: 10,
    mostrarLocal: true, 
    mostrarServico: true,
    mostrarEquipto: true
    
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AlunoFormComponent>,
    private personalService: PersonalService,
    private http: HttpClient, private cd: ChangeDetectorRef,
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
      localId: [null, Validators.required],
      servicoId: [],
      diasAula: this.fb.array([])
    });

    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    forkJoin({
      locals: this.http.get<any[]>(`${environment.apiUrl}/locals`, { headers }),
      servicos: this.http.get<any[]>(`${environment.apiUrl}/servicos`, { headers }),
      config: this.loadPersonal()
    }).subscribe(({ locals, servicos, config }) => {
      this.locals = locals;
      this.servicos = servicos;
      this.configAgenda = config;

      // --- Inicializa autocomplete ---
      this.setupLocalAutocomplete();
      this.setupServicoAutocomplete();

      // --- Inicializa formArray diasAula ---
      const formArray = this.form.get('diasAula') as FormArray;
      for (let i = 0; i < 7; i++) {
        const estaHabilitado = this.configAgenda.diasAtendimento.includes(i);
        const grupo = this.fb.group({
          ativo: [{ value: false, disabled: !estaHabilitado }],
          hora: [{ value: '', disabled: true }]
        });
        grupo.get('ativo')?.valueChanges.subscribe(ativo => {
          const horaControl = grupo.get('hora');
          ativo && estaHabilitado ? horaControl?.enable() : horaControl?.disable();
        });
        formArray.push(grupo);
      }

      if (this.data?.aluno) {
        const localSelecionado = this.locals.find(l => l.id === this.data.aluno.localId);
        const servicoSelecionado = this.servicos.find(s => s.id === this.data.aluno.servicoId);

        this.localSelecionado = localSelecionado;
        this.servicoSelecionado = servicoSelecionado;

        // Preenche IDs no form principal
        this.form.patchValue({
          nome: this.data.aluno.nome,
          telefone: this.data.aluno.telefone,
          ativo: this.data.aluno.ativo,
          email: this.data.aluno.email,
          cpf: this.data.aluno.cpf,
          datanasc: this.data.aluno.datanasc ? new Date(this.data.aluno.datanasc) : null,
          localId: localSelecionado?.id,
          servicoId: servicoSelecionado?.id
        });

        // Preenche nomes nos autocompletes
        this.localCtrl.setValue(localSelecionado?.nome || '');
        this.servicoCtrl.setValue(servicoSelecionado?.nome || '');

        // Dias de aula
        const diasAulaArray = this.form.get('diasAula') as FormArray;
        for (let i = 0; i < 7; i++) {
          const ativo = this.data.aluno[`aludia${i}`] ?? false;
          const hora = this.data.aluno[`aluhora${i}`] ?? '';
          const grupo = diasAulaArray.at(i);
          grupo.get('ativo')?.setValue(ativo);
          grupo.get('hora')?.setValue(hora);
          ativo ? grupo.get('hora')?.enable() : grupo.get('hora')?.disable();
        }
      }

      // --- Preenche valores do aluno, se houver ---
      /*if (this.data?.aluno) {
        const localSelecionado = this.locals.find(l => l.id === this.data.aluno.localId);
        const servicoSelecionado = this.servicos.find(s => s.id === this.data.aluno.servicoId);

        this.localSelecionado = localSelecionado;
        this.servicoSelecionado = servicoSelecionado;

        this.form.patchValue({
          nome: this.data.aluno.nome,
          telefone: this.data.aluno.telefone,
          ativo: this.data.aluno.ativo,
          email: this.data.aluno.email,
          cpf: this.data.aluno.cpf,
          datanasc: this.data.aluno.datanasc ? new Date(this.data.aluno.datanasc) : null,
          localId: localSelecionado?.id,
          servicoId: servicoSelecionado?.id
        });
console.log('his.data.aluno:', this.data.aluno);
console.log('localSelecionado:', localSelecionado);
console.log('this.locals :', this.locals );
console.log('this.servicos :', this.servicos);
        const diasAulaArray = this.form.get('diasAula') as FormArray;
        for (let i = 0; i < 7; i++) {
          const ativo = this.data.aluno[`aludia${i}`] ?? false;
          const hora = this.data.aluno[`aluhora${i}`] ?? '';
          const grupo = diasAulaArray.at(i);
          grupo.get('ativo')?.setValue(ativo);
          grupo.get('hora')?.setValue(hora);
          ativo ? grupo.get('hora')?.enable() : grupo.get('hora')?.disable();
        }
      }*/

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

/*
  ngOnInit(): void {

    this.form = this.fb.group({
      nome: ['', Validators.required],
      telefone: ['', Validators.required],
      ativo: [true],
      email: [''],
      cpf: [''],
      datanasc: [null],
      localId: ['', Validators.required],
      servicoId: [],
      diasAula: this.fb.array([])
    });

    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>(`${environment.apiUrl}/locals`, { headers })
      .subscribe(localsData => {
      this.locals = localsData;
      console.log('locals carregados:', this.locals);

      // Aqui você já pode preencher o campo, porque os dados chegaram
      if (this.data?.aluno?.localId) {
        const localEncontrado = this.locals.find(l => l.id === this.data.aluno.localId);
        if (localEncontrado) {
          this.localCtrl.setValue(localEncontrado.nome);
          this.localSelecionado = localEncontrado;
        }
        this.localCtrl.setValue(localEncontrado.nome);
        this.localCtrl.markAsDirty();
        this.localCtrl.markAsTouched();
      }

      // Configuração do autocomplete
      this.localCtrl.valueChanges
        .pipe(
          startWith(''),
          map(value => value?.toLowerCase()),
          map(nome => {
            const filtrado = this.locals.filter(a =>
              a.nome.toLowerCase().includes(nome)
            );
            this.localEncontrado = filtrado.length > 0;
            return filtrado;
          })
        )
        .subscribe(result => {
          this.localsFiltrados = result;
        });
    });

    this.http.get<any[]>(`${environment.apiUrl}/servicos`, { headers })
      .subscribe(servicosData => {
      this.servicos = servicosData;
      console.log('servicos carregados:', this.servicos);

      // Aqui você já pode preencher o campo, porque os dados chegaram
      if (this.data?.aluno?.servicoId) {
        const servicoEncontrado = this.servicos.find(l => l.id === this.data.aluno.servicoId);
        if (servicoEncontrado) {
          this.servicoCtrl.setValue(servicoEncontrado.nome);
          this.servicoSelecionado = servicoEncontrado;
        }
      }

      // Configuração do autocomplete
      this.servicoCtrl.valueChanges
        .pipe(
          startWith(''),
          map(value => value?.toLowerCase()),
          map(nome => {
            const filtrado = this.servicos.filter(a =>
              a.nome.toLowerCase().includes(nome)
            );
            this.servicoEncontrado = filtrado.length > 0;
            return filtrado;
          })
        )
        .subscribe(result => {
          this.servicosFiltrados = result;
        });
    });
        
    this.loadPersonal().subscribe(config => {
      this.configAgenda = config;
      console.log('diasAtendimento:', this.configAgenda.diasAtendimento); // agora sim!
      console.log('configAgenda init dentro loald:', this.configAgenda);
      console.log('this.configAgenda.diasAtendimento.length:', this.configAgenda.diasAtendimento.length);

    
      //passado para cá pq quando executado fora executa antes e não tem valores

       //const dias = this.configAgenda.diasAtendimento; // ex: [1,2,3,4,5,6]
       
      const formArray = this.form.get('diasAula') as FormArray;

      // Cria 7 entradas fixas: domingo (0) até sábado (6)
      for (let i = 0; i < 7; i++) {
        const estaHabilitado = this.configAgenda.diasAtendimento.includes(i);

        const grupo = this.fb.group({
          ativo: [{ value: false, disabled: !estaHabilitado }],
          hora: [{ value: '', disabled: true }]
        });

        grupo.get('ativo')?.valueChanges.subscribe(ativo => {
          const horaControl = grupo.get('hora');
          if (ativo && estaHabilitado) {
            horaControl?.enable();
          } else {
            horaControl?.disable();
          }
        });

        formArray.push(grupo);
      }

      console.log("diasAula:", this.form.value.diasAula);

      this.horasPossiveis = this.gerarHorasPossiveis(this.configAgenda.horaInicio, this.configAgenda.horaFim, this.configAgenda.intervaloMinutos);
      
      console.log("this.data?.aluno:", this.data?.aluno);
      
      console.log("locals:", this.locals);
      //const localSelecionado = this.locals?.find(l => l.id === this.data.aluno.localId);
      console.log("this.localSelecionado:", this.localSelecionado);

      if (this.data?.aluno) {
        this.form.patchValue({
          nome: this.data.aluno.nome,
          telefone: this.data.aluno.telefone,
          ativo: this.data.aluno.ativo,
          email: this.data.aluno.email,
          cpf: this.data.aluno.cpf,
          datanasc: this.data.aluno.datanasc
            ? new Date(this.data.aluno.datanasc)
            : null,
          localId: this.localSelecionado?.id, //this.data.aluno.localId
          servicolId: this.servicoSelecionado?.id 
        });

      
        const diasAulaArray = this.form.get('diasAula') as FormArray;

        for (let i = 0; i < 7; i++) {
          const ativo = this.data.aluno[`aludia${i}`] ?? false;
          const hora = this.data.aluno[`aluhora${i}`] ?? '';

          const grupo = diasAulaArray.at(i);
          grupo.get('ativo')?.setValue(ativo);
          grupo.get('hora')?.setValue(hora);
          if (!ativo) {
            grupo.get('hora')?.disable();
          } else {
            grupo.get('hora')?.enable();
          }
        }
      }

      if (this.localSelecionado) {
        this.form.get('localId')?.setValue(this.localSelecionado.id);
      }

      if (this.servicoSelecionado) {
        this.form.get('servicoId')?.setValue(this.servicoSelecionado.id);
      }

    });
    console.log('diasAtendimento:', this.configAgenda.diasAtendimento);
  }
*/
  salvar() {
    if (this.form.valid) {
      const formValue = this.form.value;

      const updated: any = {
        id: this.data?.aluno?.id ?? null,
        nome: formValue.nome,
        telefone: formValue.telefone,
        ativo: formValue.ativo,
        email: formValue.email,
        cpf: formValue.cpf,
        localId: this.localSelecionado?.id,
        servicoId: this.servicoSelecionado?.id,
        datanasc: formValue.datanasc,
      };

      const diasAulaArray = this.form.get('diasAula') as FormArray;

      // Garante que percorre todos os 7 dias
      diasAulaArray.controls.forEach((grupo, i) => {
        updated[`aludia${i}`] = grupo.get('ativo')?.value;
        updated[`aluhora${i}`] = grupo.get('hora')?.value || null;
      });

      console.log('updated:', updated);
      this.dialogRef.close(updated);
    }
  }
  
  fechar() {
    this.dialogRef.close();
  }

  loadPersonal(): Observable<ConfigAgenda> {
    return this.personalService.getMe().pipe(
      map(personal => ({
        diasAtendimento: [0,1,2,3,4,5,6].filter(i => (personal as any)[`dia${i}`]),
        horaInicio: personal.hora_inicio,
        horaFim: personal.hora_fim,
        intervaloMinutos: personal.intervalo_minutos,
        mostrarLocal: personal.mostrarLocal,
        mostrarServico: personal.mostrarServico,
        mostrarEquipto: personal.mostrarEquipto
      }))
    );
  }

  gerarHorasPossiveis(inicio: number, fim: number, intervaloMin: number): string[] {

    const horas: string[] = [];
    const date = new Date();
    date.setHours(inicio, 0, 0, 0);

    const end = new Date();
    end.setHours(fim, 0, 0, 0);

    while (date <= end) {
      const hora = date.getHours().toString().padStart(2, '0');
      const minuto = date.getMinutes().toString().padStart(2, '0');
      horas.push(`${hora}:${minuto}`);
      date.setMinutes(date.getMinutes() + intervaloMin);
    }

      console.log('inicio:', inicio);
      console.log('fim:', fim);
      console.log('intervaloMin:', intervaloMin);
console.log('horas possíveis:', horas);
    return horas;

  }

  get diasAulaArray(): FormArray  {
    return this.form.get('diasAula') as FormArray;
  }
/*
  onLocalSelecionado(event: MatAutocompleteSelectedEvent) {
    const nomeSelecionado = event.option.value;
    const local = this.locals.find(l => l.nome === nomeSelecionado);
    console.log('onLocalSelecionado...',local);
    if (local) {
      this.localCtrl.setValue(local.nome);
      // Aqui você pode também setar no seu form principal, por ex:
      this.form.get('localId')?.setValue(local.id);
    }
  }
*/
  onLocalSelecionado(event: MatAutocompleteSelectedEvent) {
  const nomeSelecionado = event.option.value;
  const local = this.locals.find(l => l.nome === nomeSelecionado);
  console.log('Selecionado pelo clique:', local);
  if (local && local.id) {
    this.localCtrl.setValue(local.nome);
    this.form.get('localId')?.setValue(local.id);

    // Só marca como alterado se for válido
    this.form.get('localId')?.markAsDirty();
    this.form.get('localId')?.markAsTouched();
    this.form.get('localId')?.updateValueAndValidity();

    this.form.markAsDirty();
    this.form.updateValueAndValidity();
  } else {
    // Se limpou o campo, zera e revalida para desabilitar botão
    this.form.get('localId')?.reset();
    this.form.get('localId')?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }
}


onLocalBlur() {
  const nome = this.localCtrl.value;
  const local = this.locals.find(l => l.nome === nome);
  console.log('Selecionado ao sair do campo:', local);
  if (local && local.id) {
    this.localCtrl.setValue(local.nome);
    this.form.get('localId')?.setValue(local.id);

    // Só marca como alterado se for válido
    this.form.get('localId')?.markAsDirty();
    this.form.get('localId')?.markAsTouched();
    this.form.get('localId')?.updateValueAndValidity();

    this.form.markAsDirty();
    this.form.updateValueAndValidity();
  } else {
    // Se limpou o campo, zera e revalida para desabilitar botão
    this.form.get('localId')?.reset();
    this.form.get('localId')?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }
}



  onServicoSelecionado(event: MatAutocompleteSelectedEvent) {
  const nomeSelecionado = event.option.value;
  const servico = this.servicos.find(l => l.nome === nomeSelecionado);
  console.log('Selecionado pelo clique:', servico);
  if (servico && servico.id) {
    this.servicoCtrl.setValue(servico.nome);
    this.form.get('servicoId')?.setValue(servico.id);

    // Só marca como alterado se for válido
    this.form.get('servicoId')?.markAsDirty();
    this.form.get('servicoId')?.markAsTouched();
    this.form.get('servicoId')?.updateValueAndValidity();

    this.form.markAsDirty();
    this.form.updateValueAndValidity();
  } else {
    // Se limpou o campo, zera e revalida para desabilitar botão
    this.form.get('servicoId')?.reset();
    this.form.get('servicoId')?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }
}


onServicoBlur() {
  const nome = this.servicoCtrl.value;
  const servico = this.servicos.find(l => l.nome === nome);
  console.log('Selecionado ao sair do campo:', servico);
  if (servico && servico.id) {
    this.servicoCtrl.setValue(servico.nome);
    this.form.get('servicoId')?.setValue(servico.id);

    // Só marca como alterado se for válido
    this.form.get('servicoId')?.markAsDirty();
    this.form.get('servicoId')?.markAsTouched();
    this.form.get('servicoId')?.updateValueAndValidity();

    this.form.markAsDirty();
    this.form.updateValueAndValidity();
  } else {
    // Se limpou o campo, zera e revalida para desabilitar botão
    this.form.get('servicoId')?.reset();
    this.form.get('servicoId')?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }
}

  /*
  onLocalSelecionado(event: MatAutocompleteSelectedEvent) {
    const local = this.locals.find(l => l.nome === event.option.value);
    console.log('onLocalSelecionado...',local);
    if (local) {
      console.log('onLocalSelecionado...entrou',local);
      this.localCtrl.setValue(local.nome, { emitEvent: true });
      this.localSelecionado = local;

      // Marcar como alterado
      this.localCtrl.markAsDirty();
      this.localCtrl.markAsTouched();
    }
  }
    */
  /*
  onLocalSelecionado(event: MatAutocompleteSelectedEvent) {

    const selecionado = this.locals.find(l => l.nome === event.option.value);
    console.log('selecionado', selecionado);
    if (selecionado) {
      this.localSelecionado = selecionado;
      this.form.get('localId')?.setValue(selecionado.id);
    }
  }*/

  onLocalSelected(nome: string) {
    console.log('onLocalSelected...');
    const local = this.locals.find(a => a.nome === nome);
    if (local) {
      console.log('localId: ', local.id);
      this.form.patchValue({ localId: local.id });
      this.localSelecionado = local;
      console.log('localSelecionado: ', this.localSelecionado);
      this.localCtrl.markAsDirty();
      this.localCtrl.markAsTouched();
    } else {
      this.form.patchValue({ localId: '' });
    }
  }
    
  onServicoSelected(nome: string) {
    console.log('onServicoSelected...');
    const servico = this.servicos.find(a => a.nome === nome);
    if (servico) {
      console.log('servicoId: ', servico.id);
      this.form.patchValue({ servicoId: servico.id });
      this.servicoSelecionado = servico;
      console.log('servicoSelecionado: ', this.servicoSelecionado);
      this.localCtrl.markAsDirty();
      this.localCtrl.markAsTouched();
    } else {
      this.form.patchValue({ servicoId: '' });
    }
  }

}
