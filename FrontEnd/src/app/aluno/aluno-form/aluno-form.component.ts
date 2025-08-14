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
    private http: HttpClient,
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
      localId: ['', Validators.required],
      servicoId: [],
      diasAula: this.fb.array([])
    });

    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
console.log('ON INIT:'); // agora sim!
/*    this.http.get<any[]>(`${environment.apiUrl}/locals`, { headers }).subscribe(data => {    
      this.locals = data;
console.log('locals 1:', this.locals); // agora sim!
      this.localCtrl.valueChanges
        .pipe(
          startWith(''),
          map(value => value?.toLowerCase()),
          map(nome => {
            const filtrado = this.locals.filter(a => a.nome.toLowerCase().includes(nome));
            this.localEncontrado = filtrado.length > 0;
            return filtrado;
          })
        )
        .subscribe(result => {
          this.localsFiltrados = result;
        });
    });

    */
    //const localSelecionado = this.locals?.find(l => l.id === comp.localId);

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

    
      /*passado para cá pq quando executado fora executa antes e não tem valores*/ 

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
          localId: this.localSelecionado?.id, /*this.data.aluno.localId*/
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
 

      /**/
      //this.localSelecionado = this.locals?.find(l => l.id ===  this.data.aluno.localId);
      if (this.localSelecionado) {
//        this.localCtrl.setValue(this.localSelecionado.nome);
        this.form.get('localId')?.setValue(this.localSelecionado.id);
      }

      if (this.servicoSelecionado) {
        this.form.get('servicoId')?.setValue(this.servicoSelecionado.id);
      }

      /**/
    });
    console.log('diasAtendimento:', this.configAgenda.diasAtendimento);
  }

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

  onLocalSelected(nome: string) {
    console.log('onLocalSelected...');
    const local = this.locals.find(a => a.nome === nome);
    if (local) {
      console.log('localId: ', local.id);
      this.form.patchValue({ localId: local.id });
      this.localSelecionado = local;
      console.log('localSelecionado: ', this.localSelecionado);
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
    } else {
      this.form.patchValue({ servicoId: '' });
    }
  }

}
