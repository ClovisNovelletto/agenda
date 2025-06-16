import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatOptionModule } from '@angular/material/core';
import { HttpHeaders } from '@angular/common/http';
import { startWith, map } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { AddAlunoDialogComponent } from '../add-aluno-dialog/add-aluno-dialog.component'; // ajuste o caminho conforme necessário
import { AddLocalDialogComponent } from '../add-local-dialog/add-local-dialog.component';
import { environment } from '../../environments/environment';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ChangeDetectorRef } from '@angular/core';

   
@Component({
  standalone: true,
  selector: 'app-appointment-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [MatNativeDateModule],
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.css'],
  

})

export class AppointmentDialogComponent {
  titulo: string = '';
  descricao: string = '';
  selectedAluno: number | null = null;
  selectedLocal: number | null = null;
  selectedPersonal: number | null = null;
  alunos: any[] = [];
  locals: any[] = [];
  personals: any[] = [];
  date: Date;
  hour: string;
  form!: FormGroup;
  alunoCtrl = new FormControl('', Validators.required);
  alunosFiltrados: any[] = [];
  alunoSelecionado: any = null;
  alunoEncontrado: boolean = true;

  localCtrl = new FormControl('');
  localsFiltrados: any[] = [];
  localSelecionado: any = null;
  localEncontrado: boolean = true;
  novoAlunoRetorno: any[] = [];
  atualizouAlunos: boolean = false;
  novoLocalRetorno: any[] = [];
  atualizouLocals: boolean = false;
  horasPossiveis: string[] = [];
  intervalo: number = 10; // valor padrão
  horaInicio: number = 6; // valor padrão
  horaFim: number = 22; // valor padrão

  constructor(
    public dialogRef: MatDialogRef<AppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.date = data.date;
    this.hour = data.hour || '';
    this.alunos = data.alunos || [];
    this.locals = data.locals || [];
    this.selectedPersonal = data.personalId || null;
    this.intervalo = data.intervalo ?? 10; // 👈 Aqui está certo
    this.horaInicio = data.horaInicio
    this.horaFim = data.horaFim
    console.log('intervalo recebido no filho:', this.intervalo);
  }

  ngOnInit() {
    console.log('this.data:', this.data);
    this.atualizouAlunos = false;
    this.atualizouLocals = false;
    this.intervalo = this.data.intervalo || 10; // fallback para 10 min se não vier
    console.log('this.data.intervalo', this.data.intervalo);
    this.horasPossiveis = this.gerarHorasPossiveis(this.horaInicio, this.horaFim, this.intervalo);
    this.form = this.fb.group({
      data: [null, Validators.required],
      hour: ['', Validators.required],
      titulo: ['', Validators.required],
      descricao: [''],
      alunoId: ['', Validators.required],
      localId: ['', Validators.required],
    });

    this.form.patchValue({
      data: this.data.date || null,
      hour: this.formatarHora(this.data.date),
    });
    this.cdr.detectChanges();
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    if (this.data.compromisso) {
      const comp = this.data.compromisso;

      const alunoSelecionado = this.alunos?.find(a => a.id === comp.alunoId);
      const localSelecionado = this.locals?.find(l => l.id === comp.localId);

      this.form.patchValue({
        titulo: comp.titulo,
        descricao: comp.descricao, // se existir no form
        alunoId: alunoSelecionado?.id || null,
        localId: localSelecionado?.id || null,
        data: comp.date ? new Date(comp.date) : null,
        hour: this.formatarHora(comp.date),
      });

      // Só para exibir no campo de autocomplete:
      this.alunoSelecionado = this.alunos?.find(a => a.id === this.data.compromisso.alunoId);
      if (this.alunoSelecionado) {
        this.alunoCtrl.setValue(this.alunoSelecionado.nome);
        this.form.get('alunoId')?.setValue(this.alunoSelecionado.id); // <-- isso garante que salva
      }

      this.localSelecionado = this.locals?.find(l => l.id === this.data.compromisso.localId);
      if (this.localSelecionado) {
        this.localCtrl.setValue(this.localSelecionado.nome);
        this.form.get('localId')?.setValue(this.localSelecionado.id);
      }

      /*desabilitar botão de salvar se limpar o aluno*/ 
      this.alunoCtrl.valueChanges.subscribe(value => {
      const encontrado = this.alunos.find(a => a.nome === value);
        
      if (encontrado) {
        this.form.get('alunoId')?.setValue(encontrado.id);
      } else {
        // Se não houver correspondência, limpa o alunoId
        this.form.get('alunoId')?.setValue(null);
      }
      });

      /*desabilitar o botão de salvar se limpar o local*/ 
      this.localCtrl.valueChanges.subscribe(value => {
      const encontrado = this.locals.find(a => a.nome === value);
        
      if (encontrado) {
        this.form.get('localId')?.setValue(encontrado.id);
      } else {
        // Se não houver correspondência, limpa o localId
        this.form.get('localId')?.setValue(null);
      }
      });

    }

    /*this.http.get<any[]>('/api/alunos', { headers }).subscribe(data => {*/
    this.http.get<any[]>(`${environment.apiUrl}/alunos`, { headers }).subscribe(data => {    
      this.alunos = data;

      this.alunoCtrl.valueChanges
        .pipe(
          startWith(''),
          map(value => value?.toLowerCase()),
          map(nome => {
            const filtrado = this.alunos.filter(a => a.nome.toLowerCase().includes(nome));
            this.alunoEncontrado = filtrado.length > 0;
            return filtrado;
          })
        )
        .subscribe(result => {
          this.alunosFiltrados = result;
        });
    });

    /*  this.http.get<any[]>('/api/locals', { headers }).subscribe(data => {*/
    this.http.get<any[]>(`${environment.apiUrl}/locals`, { headers }).subscribe(data => {    
      this.locals = data;

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
  }
  
  onAlunoSelected(nome: string) {
    console.log('onAlunoSelected...');
    const aluno = this.alunos.find(a => a.nome === nome);
    if (aluno) {
      console.log('alunoId: ', aluno.id);
      this.form.patchValue({ alunoId: aluno.id });
      this.alunoSelecionado = aluno;
      console.log('alunoSelecionado: ', this.alunoSelecionado);
    } else {
      this.form.patchValue({ alunoId: '' });
    }
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

  abrirModalNovoAluno() {
    const nome = this.alunoCtrl.value;

    // Abre o modal para pedir o telefone do novo aluno
    const dialogRef = this.dialog.open(AddAlunoDialogComponent, {
      width: '400px',
      height: '300px',
      panelClass: 'custom-aluno-dialog',
      data: { nomeParcial: this.alunoCtrl.value || '' } // Passa o nome do aluno já digitado para preencher o campo no modal
    });

    dialogRef.afterClosed().subscribe(result => {
      // Quando o modal é fechado e temos o telefone, fazemos a requisição
      if (result?.nome && result?.telefone) {
        const token = localStorage.getItem('jwt-token');
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        const body = { nome: result.nome, telefone: result.telefone };

        /*this.http.post('/api/alunos', body, { headers }).subscribe((novoAluno: any) => {*/
        this.http.post(`${environment.apiUrl}/alunos`, body, { headers }).subscribe((novoAluno: any) => {
          // Adiciona o novo aluno à lista e atualiza o campo de seleção
          console.log('Novo aluno recebido do backend:', novoAluno);
          //this.alunos.push(novoAluno);
          const jaExiste = this.alunos.some(a => a.id == novoAluno.id);
          if (!jaExiste) {
            this.alunos.push(novoAluno);
            this.novoAlunoRetorno= novoAluno;
            this.atualizouAlunos = true;
          }
          console.log('novoAluno.nome: ', novoAluno.nome);
          console.log('novoAluno.id: ', novoAluno.id);
          this.alunoCtrl.setValue(novoAluno.nome);
          this.form.patchValue({ alunoId: novoAluno.id });
          this.alunoSelecionado = novoAluno;
        });
      }
    });
  }
 
  abrirModalNovoLocal() {
    const nome = this.localCtrl.value;

    // Abre o modal para pedir o endereco do novo local
    const dialogRef = this.dialog.open(AddLocalDialogComponent, {
      width: '400px',
      height: '300px',
      panelClass: 'custom-local-dialog',
      data: { nomeParcial: this.localCtrl.value || '' } // Passa o nome do local já digitado para preencher o campo no modal
    });

    dialogRef.afterClosed().subscribe(result => {
      // Quando o modal é fechado e temos o endereco, fazemos a requisição
      if (result?.nome && result?.endereco) {
        const token = localStorage.getItem('jwt-token');
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        const body = { nome: result.nome, endereco: result.endereco };

        /*this.http.post('/api/locals', body, { headers }).subscribe((novoLocal: any) => {*/
        this.http.post(`${environment.apiUrl}/locals`, body, { headers }).subscribe((novoLocal: any) => {
          // Adiciona o novo local à lista e atualiza o campo de seleção
          console.log('Novo local recebido do backend:', novoLocal);
          //this.locals.push(novoLocal);
          const jaExiste = this.locals.some(a => a.id == novoLocal.id);
          if (!jaExiste) {
            this.locals.push(novoLocal);
            this.novoLocalRetorno= novoLocal;
            this.atualizouLocals = true;
          }
          console.log('novoLocal.nome: ', novoLocal.nome);
          console.log('novoLocal.id: ', novoLocal.id);
          this.localCtrl.setValue(novoLocal.nome);
          this.form.patchValue({ localId: novoLocal.id });
          this.localSelecionado = novoLocal;
        });
      }
    });
  }

  save(): void {
          console.log('this.data.date: ', this.data.date);
          console.log('this.data.hour: ', this.data.hour);
    if (this.form.invalid) {
      console.log('form inválido: ');
      this.form.markAllAsTouched(); // Isso força a exibição dos erros
      return; // Cancela o salvamento
    }          

      // Cria um objeto Date com a data que já está no formato correto
      const dataCompleta = new Date(this.data.date);

      if (!this.form.value.hour) {
        console.error('Hora não preenchida');
        return;
      }
      const [hour, minute] = this.form.value.hour.split(':');
      // Ajusta a hora e os minutos com base em `this.data.hour`
      //const [hour, minute] = this.data.hour.split(':'); // Assume que `this.data.hour` é no formato "HH:mm"
      dataCompleta.setHours(parseInt(hour, 10)); // Define a hora
      dataCompleta.setMinutes(parseInt(minute, 10)); // Define os minutos
      console.log('dataCompleta', dataCompleta);
      const dados = this.form.value;
      this.dialogRef.close({

      atualizouAlunos: this.atualizouAlunos,     // ✅ indica que houve inclusão de aluno
      aluno: this.novoAlunoRetorno,              // ✅ o novo aluno criado no dialog
      atualizouLocals: this.atualizouLocals,     // ✅ indica que houve inclusão de local
      local: this.novoLocalRetorno,              // ✅ o novo local criado no dialog
      titulo: dados.titulo,
      descricao: this.descricao,
      alunoId: this.alunoSelecionado?.id,
      localId: this.localSelecionado?.id,
      //alunoId: this.selectedAluno,
      //localId: this.selectedLocal,
      personalId: this.selectedPersonal,
      date: dataCompleta, //this.data.date,
      hour: this.data.hour

    });
  }

  cancel() {
    this.dialogRef.close();
  }

  formatarHora(date: Date): string {
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
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

    return horas;
    /*
    const horas: string[] = [];
    for (let h = inicio; h <= fim; h++) {
      for (let m = 0; m < 60; m += 10) {
        const hora = h.toString().padStart(2, '0');
        const minuto = m.toString().padStart(2, '0');
        horas.push(`${hora}:${minuto}`);
      }
    }
    return horas;
    */
  }
}
