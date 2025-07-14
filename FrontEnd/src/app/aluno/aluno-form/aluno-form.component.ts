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

@Component({
  selector: 'app-aluno-form',
  imports: [MatInputModule, MatNativeDateModule, MatSlideToggleModule, CommonModule, MatCheckboxModule,
            ReactiveFormsModule, MatFormFieldModule, MatInputModule,  MatSlideToggleModule, MatOptionModule, MatSelectModule,
            MatButtonModule, MatDialogModule, MatIconModule, MatToolbarModule, MatDatepickerModule, MatFormField], // Adicione o RouterModule aqui]
  templateUrl: './aluno-form.component.html'
})
export class AlunoFormComponent implements OnInit {
  form!: FormGroup;
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
    intervaloMinutos: 10
    
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AlunoFormComponent>,
    private personalService: PersonalService,
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
        diasAula: this.fb.array([])
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

      /*  
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
        */
      console.log("diasAula:", this.form.value.diasAula);
      /*
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

        (this.form.get('diasAula') as FormArray).push(grupo);
      }
      */
      /*for (let i = 0; i < 7; i++) {
        if (this.configAgenda.diasAtendimento.includes(i)) {
          const grupo = this.fb.group({
            ativo: [false],
            hora: ['']
          });

          grupo.get('ativo')?.valueChanges.subscribe(ativo => {
            const horaControl = grupo.get('hora');
            if (ativo) {
              horaControl?.enable();
            } else {
              horaControl?.disable();
            }
          });

          grupo.get('hora')?.disable();
          formArray.push(grupo);
        } else {
          // Se o personal não atende esse dia, ainda assim mantém o espaço para manter alinhamento
          // Isso evita confusão nos índices
          formArray.push(this.fb.group({
            ativo: [{ value: false, disabled: true }],
            hora: [{ value: '', disabled: true }]
          }));
        }
      }*/
      /*
      this.configAgenda.diasAtendimento.forEach((_, i) => {
        const grupo = this.fb.group({
          ativo: [false],
          hora: ['']
        });

        // Habilita/desabilita o campo 'hora' conforme o 'ativo' muda
        grupo.get('ativo')?.valueChanges.subscribe(ativo => {
          const horaControl = grupo.get('hora');
          if (ativo) {
            horaControl?.enable();
          } else {
            horaControl?.disable();
          }
        });

        grupo.get('hora')?.disable(); // Começa desabilitado
        (this.form.get('diasAula') as FormArray).push(grupo);
      });*/

      this.horasPossiveis = this.gerarHorasPossiveis(this.configAgenda.horaInicio, this.configAgenda.horaFim, this.configAgenda.intervaloMinutos);

      if (this.data?.aluno) {
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

        const diasAulaArray = this.form.get('diasAula') as FormArray;

        for (let i = 0; i < diasAulaArray.length; i++) {
          const grupo = diasAulaArray.at(i) as FormGroup;
          const ativo = this.data.aluno[`aludia${i}`];
          const hora = this.data.aluno[`aluhora${i}`] || '';

          grupo.get('ativo')?.setValue(ativo);
          grupo.get('hora')?.setValue(hora);

          if (ativo) {
            grupo.get('hora')?.enable();
          } else {
            grupo.get('hora')?.disable();
          }
        }
      }      
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
        datanasc: formValue.datanasc,
      };

      // Adiciona aludia0...6 e aluhora0...6
      formValue.diasAula.forEach((dia: any, index: number) => {
        updated[`aludia${index}`] = dia.ativo;
        updated[`aluhora${index}`] = dia.hora || null;
      });
      console.log('updated:', updated);
      this.dialogRef.close(updated);
    }
  }
  /*
  salvar() {
    if (this.form.valid) {
      const updated: Aluno = {
        id: this.data?.aluno?.id ?? null,
        ...this.form.value
      };
      this.dialogRef.close(updated);
    }
  }*/

  fechar() {
    this.dialogRef.close();
  }

  loadPersonal(): Observable<ConfigAgenda> {
    return this.personalService.getMe().pipe(
      map(personal => ({
        diasAtendimento: [0,1,2,3,4,5,6].filter(i => (personal as any)[`dia${i}`]),
        horaInicio: personal.hora_inicio,
        horaFim: personal.hora_fim,
        intervaloMinutos: personal.intervalo_minutos
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

}
