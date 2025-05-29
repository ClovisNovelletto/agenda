import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import {  } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Aluno } from '../models/aluno.model';
import { Local } from '../models/local.model';
import { Personal } from '../models/personal.model';
import { ConfigAgenda } from '../models/configAgenda.model';
import { HttpHeaders } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { Appointment } from '../models/appointment'; // ajuste o caminho conforme sua estrutura
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { environment } from '../../../src/environments/environment';
//import { Configuracoes } from '../configuracoes/configuracoes.component';
import { PersonalService } from '../services/personal.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatTableModule,
    DragDropModule,
    CdkDropList,
  //  Configuracoes,
  ],

 
})
export class AgendaComponent implements OnInit, AfterViewInit {
  @ViewChildren(CdkDropList) dropLists!: QueryList<CdkDropList>;
  connectedDropLists: CdkDropList[] = [];
  weekDates: Date[] = [];
  hours: string[] = [];
  alunos: Aluno[] = [];
  locals: Local[] = [];
  personals: Personal[] = [];
  personal?:  Personal;
  selectedAlunoId: number | null = null;
  selectedLocalId: number | null = null;
  selectedPersonalId: number | null = null;
  appointments: Appointment[] = [];
  //readonly minutes: number[] = [0, 10, 20, 30, 40, 50];
  minutes: number[]=[];
  hoveredCell: string | null = null;
  isDragging = false;
  
  configAgenda: ConfigAgenda = {
    diasAtendimento: [],
    horaInicio: 8,
    horaFim: 18,
    intervaloMinutos: 10
  };

  //appointments: { date: string; hour: string; titulo: string }[] = [];

  selectedDay: Date | null = null;
  selectDay(day: Date) {
    this.selectedDay = day;
  }

  selectedHour: string | null = null;
  selectHour(hour: string) {
    this.selectedHour = hour;
  }

  appointmentTitle: string = '';

  appointmentDescription: string = '';
  currentDate: Date = new Date();    
  week: Date[] = [];
  isMobile: boolean = false;
  dropListIds: string[] = [];

  constructor(private dialog: MatDialog, private http: HttpClient, private personalService: PersonalService) {}

  

  ngOnInit(): void {

    console.log('AgendaComponent iniciado');
    this.isMobile = window.innerWidth <= 768; // ajustável conforme seu layout
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 768;
        this.isMobile = window.innerWidth <= 768;
    });
    const today = new Date();

    this.loadPersonal().subscribe(config => {
      this.configAgenda = config;
      console.log('configAgenda init dentro loald:', this.configAgenda);
console.log('this.configAgenda.diasAtendimento.length:', this.configAgenda.diasAtendimento.length);
    this.generateMinutes(); // gerar os minutos corretamente
    this.generateAllDropListIds(); // agora com os minutos corretos
    this.generateWeek();           // se também depende disso
//    this.generateWeek();     // só chama após o carregamento
    this.generateHours();
    });
/*
  this.personalService.getConfiguracoes().subscribe(config => {
    this.configAgenda = config;
    this.generateMinutes(); // gerar os minutos corretamente
    this.generateAllDropListIds(); // agora com os minutos corretos
    this.generateWeek();           // se também depende disso
  });
*/
    //this.loadPersonals();
    console.warn('configAgenda init:', this.configAgenda);
    this.loadAppointments();    
    //this.generateWeek();
    //this.generateHours();
    this.loadAlunos();
    this.loadLocals();
    
    //this.generateAllDropListIds();
    //console.log('Horários de compromissos:', this.appointments.map(a => a.start.toISOString()));
    console.log('Horários de compromissos completos:', this.appointments);
  }


 /* 
  interface ConfigPersonal {
  diasAtendimento: number[]; // [1,2,3,4,5] => Seg a Sex
  horaInicio: number;        // 8
  horaFim: number;           // 18
  intervaloMinutos: number;  // 10, 30, 60
}
*/

generateWeek(): void {
  const baseDate = new Date(this.currentDate);
  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Domingo (0)

  this.week = this.configAgenda.diasAtendimento.map(dia => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + dia); // Pula direto para o dia desejado
    date.setHours(0, 0, 0, 0);
    return date;
  });
}

/*
generateWeek(): void {
  const startOfWeek = new Date(this.currentDate);
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek); // Domingo

  this.week = [];

  for (let i = 0; i < this.configAgenda.diasAtendimento.length; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    day.setHours(0, 0, 0, 0);
    if (this.configAgenda.diasAtendimento.includes(day.getDay())) {
      this.week.push(new Date(day));
    }
  }
}
*/
generateHours() {
  this.hours = []; // resetar
  const start = this.configAgenda.horaInicio;
  const end = this.configAgenda.horaFim;
 console.log('start:', start);
  console.log('ends:', end);
  for (let hour = start; hour <= end; hour++) {
    this.hours.push(`${hour.toString().padStart(2, '0')}:00`);
  }
}

/*
opcional com intervalos 30 min
generateHours() {
  this.hours = [];
  const start = this.configPersonal.horaInicio;
  const end = this.configPersonal.horaFim;

  for (let hour = start; hour <= end; hour++) {
    this.hours.push(`${hour.toString().padStart(2, '0')}:00`);
    this.hours.push(`${hour.toString().padStart(2, '0')}:30`);
  }
}
*/

/*
generateWeek(): void {
  const startOfWeek = new Date(this.currentDate);
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek); // Domingo

  this.week = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);  // cria um novo Date baseado no domingo
    day.setDate(startOfWeek.getDate() + i);
    day.setHours(0, 0, 0, 0); // <-- zera a hora!
    console.log('generateWeek:',new Date(day));
    return new Date(day); // força nova instância separada
  });
}
*/
/*
generateHours() {
  for (let hour = 8; hour <= 18; hour++) {
    this.hours.push(`${hour.toString().padStart(2, '0')}:00`);
  }
}
*/

generateDropListId(day: Date, hour: string, minute: number): string {
  return `${day.toDateString()}-${hour}-${minute}`;
}

generateMinutes(): void {
  this.minutes = [];
  const intervalo = this.configAgenda.intervaloMinutos || 10;
  for (let i = 0; i < 60; i += intervalo) {
    this.minutes.push(i);
  }
  this.configAgenda.intervaloMinutos
  console.log(' this.configAgenda.intervaloMinutos:',  this.configAgenda.intervaloMinutos);
  console.log('this.minutes:', this.minutes);
}

generateAllDropListIds() {
  this.dropListIds = [];
  for (const day of this.week) {
    for (const hour of this.hours) {
      for (const minute of this.minutes) {
        this.dropListIds.push(this.generateDropListId(day, hour, minute));
      }
    }
  }
  console.log('dropListIds:', this.dropListIds);
}

nextWeek() {
  this.currentDate.setDate(this.currentDate.getDate() + 7);
  //this.week = this.generateWeek(this.currentDate); // ✅ atribuição correta
  this.generateWeek(); // ✅ atribuição correta
}

previousWeek() {
  this.currentDate.setDate(this.currentDate.getDate() - 7);
  //this.week = this.generateWeek(this.currentDate); // ✅ atribuição correta
  this.generateWeek(); // ✅ atribuição correta
}

getAppointments(day: Date, hour: string, minute: number): Appointment[] {
  const target = new Date(day);
  const [h] = hour.split(':');
  target.setHours(+h, minute, 0, 0);

  return this.appointments.filter(appt => {
    const apptDate = new Date(appt.start);
    return apptDate.getTime() === target.getTime();
  });
}


saveAppointment(
  agenda_id: BigInteger,
  titulo: string,
  descricao: string,
  date: Date,
  hour: string,
  alunoId: number,
  aluno: string,
  localId: number,
  local: string,
  /*personalId: number,*/
  start: Date
): void {
  const [h, m] = [start.getHours(), start.getMinutes()];
  const formattedHour = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

  const newAppointment: Appointment = {
    agenda_id,
    titulo,
    descricao,
    date,
    start,
    hour: formattedHour,
    alunoId,
    aluno,
    localId,
    local,
    /*personalId*/
  };

  this.appointments.push(newAppointment);
  console.log('Novo compromisso salvo:', newAppointment);
}

openAppointmentModal(day: Date, hour: string, minute: number) {
  const [h] = hour.split(':');
  const start = new Date(day);
  start.setHours(+h, minute, 0, 0);

  const dialogRef = this.dialog.open(AppointmentDialogComponent, {
    width: '300px',
    data: {
      date: start,
      alunos: this.alunos,
      locals: this.locals,
      personalId: 1 //this.personalId // ajuste conforme o nome do id do personal
    }
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result?.atualizouAlunos && result.aluno) {
      const jaExiste = this.alunos.some(a => a.id === result.aluno.id);
      console.log('afterClosedo openAppointmentModal antes',  this.alunos);      
      if (!jaExiste) {
        this.alunos.push(result.aluno);
      }
    console.log('afterClosedo openAppointmentModal depois',  this.alunos);      
    }
    if (result?.titulo) {
      const start = new Date(day);
      const [h] = hour.split(':');
      start.setHours(+h, minute, 0, 0);
      this.saveAppointment(
        result.agenda_id,
        result.titulo,
        result.descricao,
        result.date,
        result.hour,
        result.alunoId,
        result.aluno,
        result.localId,
        result.local,
        /*result.personalId,*/
        start
      );
      console.log("openAppointmentModal",'openAppointmentModal!');
      console.log("result",result);
      this.salvarCompromisso(result);
    }
  });
}

  salvarCompromisso(comp: any): void {
    const token = localStorage.getItem('jwt-token');
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const compromisso = {
      /*personalId: comp.personalId,*/ // opcional se já vem do token
      agenda_id: comp.agenda_id,
      alunoId: comp.alunoId,
      localId: comp.localId,
      data: comp.date,
      /*hora: comp.hour,*/
      titulo: comp.titulo,
      //descricao: comp.descricao,
      status: 1 /*'agendado' // padrão*/
    };

    console.log('Compromisso dados enviados!');
    console.log(compromisso);

    if (comp.agenda_id) {
      /*this.http.put('/api/agendas', compromisso, { headers }).subscribe({*/
      this.http.put(`${environment.apiUrl}/agendas`, compromisso, { headers }).subscribe({
        next: () => {
          console.log('Compromisso atualizado com sucesso!');
          // Aqui você pode recarregar a agenda ou dar feedback ao usuário
          this.loadAppointments();
        },
        error: (err) => {
          console.error('Erro ao atualizar  compromisso:', err);
        }
      });
    }else{


      /*this.http.post('/api/agendas', compromisso, { headers }).subscribe({*/
      this.http.post(`${environment.apiUrl}/agendas`, compromisso, { headers }).subscribe({
        next: () => {
          console.log('Compromisso inserido com sucesso!');
          // Aqui você pode recarregar a agenda ou dar feedback ao usuário
          this.loadAppointments();
        },
        error: (err) => {
          console.error('Erro ao inserir compromisso:', err);
        }
      });
    }
  }
  
loadAppointments() {
  console.log('Iniciando requisição HTTP...');
  const token = localStorage.getItem('jwt-token');
  const headers = new HttpHeaders({Authorization: `Bearer ${token}` });    
  this.http.get<any[]>(`${environment.apiUrl}/agendas`, {headers}).subscribe((data) => {
    this.appointments = data.map((item) => ({
      agenda_id: item.agenda_id,
      date: new Date(item.date),
      start: new Date(item.start),
      hour: item.hour,
      titulo: item.titulo,
      alunoId: item.alunoid,
      aluno: item.aluno,
      localId: item.localid,
      local: item.local,
      personalId: item.personalid
    }));
    console.log('Dados recebidos: ', this.appointments);
    console.log('Horários de compromissos:', this.appointments.map(a => a.start.toISOString()));
    console.log('Appointments mapeados:', this.appointments);
  });
}

loadAlunos(): void {
  const token = localStorage.getItem('jwt-token');
  const headers = new HttpHeaders({Authorization: `Bearer ${token}` });    
  this.http.get<Aluno[]>(`${environment.apiUrl}/alunos`, {headers}).subscribe((alunos) => {
    this.alunos = alunos;
  });
}

loadLocals(): void {
  const token = localStorage.getItem('jwt-token');
  const headers = new HttpHeaders({Authorization: `Bearer ${token}` });    
  this.http.get<Aluno[]>(`${environment.apiUrl}/locals`, {headers}).subscribe((locals) => {
    this.locals = locals;
  });
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
/*
loadPersonals(): void {

  this.personalService.getMe().subscribe(personal => {
  this.personal = personal;

    this.configAgenda = {
    diasAtendimento: [],
    horaInicio: parseInt(personal.hora_inicio.split(':')[0], 10),
    horaFim: parseInt(personal.hora_fim.split(':')[0], 10),
    intervaloMinutos: personal.intervalo_minutos
  };
  for (let i = 0; i <= 6; i++) {
    if ((personal as any)[`dia${i}`]) {
        this.configAgenda.diasAtendimento.push(i);
    }
  }
  console.warn('configAgenda load:', this.configAgenda);
  
  })
}
  */
//  const token = localStorage.getItem('jwt-token');
//  const headers = new HttpHeaders({Authorization: `Bearer ${token}`});  
//  this.http.get<Personal[]>(`${environment.apiUrl}/personals`, {headers}).subscribe((personals) => {
  //this.personals = personals;
  
//  const personal = personals[0];
//  this.configAgenda = {
//    diasAtendimento: [],
//    horaInicio: parseInt(personal.hora_inicio.split(':')[0], 10),
//    horaFim: parseInt(personal.hora_fim.split(':')[0], 10),
//    intervaloMinutos: personal.intervalo_minutos
  //};
//  for (let i = 0; i <= 6; i++) {
//    if ((personal as any)[`dia${i}`]) {
//        this.configAgenda.diasAtendimento.push(i);
//    }
  //}
//  console.warn('configAgenda:', this.configAgenda);
  //});
//}


getDateTime(appt: Appointment): Date {
  if (!appt?.hour || !appt?.date) {
    console.warn('Compromisso incompleto:', appt);
    return new Date(); // ou null, dependendo do que você quiser exibir
  }

  const [h, m] = appt.hour.split(':');
  const date = new Date(appt.date);
  date.setHours(+h, +m);
  return date;
}


formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}


hasAppointment(day: Date, hour: string, minute: number): boolean {
  const target = new Date(day);
  const [h] = hour.split(':');
  target.setHours(+h, minute, 0, 0);
//console.log('Verificando:', target.toISOString());
  return this.appointments.some(appt => {
    const apptDate = new Date(appt.start); // usando `start` agora
    return apptDate.getFullYear() === target.getFullYear() &&
           apptDate.getMonth() === target.getMonth() &&
           apptDate.getDate() === target.getDate() &&
           apptDate.getHours() === target.getHours() &&
           apptDate.getMinutes() === target.getMinutes();
  });

}

editarCompromisso(appt: any): void {
  console.log('entrou no ediar:');
  console.log('appt:', appt );
  const safeDate = new Date(Date.parse(appt.date));

  console.log('appt.data:', appt.date );
  console.log('safeDate:', safeDate );
  const dialogRef = this.dialog.open(AppointmentDialogComponent, {
    width: '300px',
    data: {
      date: safeDate,
      hour: appt.data, // se quiser passar como string também
      compromisso: appt,  // envia todos os dados do compromisso
      alunos: this.alunos,     // 👈 passa a lista
      locals: this.locals,     // 👈 passa a lista
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.atualizouAlunos && result.aluno) {
      console.log('afterClosedo editarCompromisso antes',  this.alunos);      
      const jaExiste = this.alunos.some(a => a.id === result.aluno.id);
      if (!jaExiste) {
        this.alunos.push(result.aluno);
      }
     console.log('afterClosedo editarCompromisso depois',  this.alunos);      
    }
    if (result?.titulo) {
      // Atualiza compromisso existente
      console.log('result:', result );
      //alunoId, localId, data, /*hora,*/ titulo, /*descricao,*/ status 
      const updated = {
        agenda_id: appt.agenda_id,
        alunoId: result.alunoId,
        localId: result.localId,
        date: result.date,
        titulo: result.titulo,
        status: 1,
        //alunos: this.alunos,     // 👈 passa a lista
        //locals: this.locals,
        /*personalId: result.personalId*/
      };
      console.log('updated:', updated );
      this.salvarCompromisso(updated); // mesma função que salva novo ou atualiza
    }
  });
}

ngAfterViewInit(): void {
    // Aguarda renderização completa das listas
    setTimeout(() => {
     this.connectedDropLists = this.dropLists.toArray();
    });
  }

  
onDrop(event: CdkDragDrop<any>) {

const appt = event.item.data.appointment;
const toDay = new Date(event.container.data.day); // já é uma Date
const hour = event.container.data.hour;
const minute = event.container.data.minute;

const fromDate = new Date(event.item.data.appointment.start); // ou .date
const toDate = buildDateWithTime(toDay, event.container.data.hour, event.container.data.minute);
console.log("From:", fromDate, "|", fromDate.getTime());
console.log("To:", toDate, "|", toDate.getTime());


  const sameDay = fromDate.toDateString() === toDate.toDateString();
  const sameTime = fromDate.getHours() === toDate.getHours() && fromDate.getMinutes() === toDate.getMinutes();

  if (sameDay && sameTime) {
    console.log('Sem alterações necessárias.');
    return;
  }


   // Atualiza o compromisso com nova data e hora
  //appointment.date = toDate;
  //appointment.hour = this.formatHour(toDate); // ex: '08:30'

      const updated = {
        agenda_id: appt.agenda_id,
        alunoId: appt.alunoId,
        localId: appt.localId,
        date: toDate,
        titulo: appt.titulo,
        status: 1,
        //alunos: this.alunos,     // 👈 passa a lista
        //locals: this.locals,
        /*personalId: result.personalId*/
      };
      console.log('updated:', updated );
      this.salvarCompromisso(updated); // mesma função que salva novo ou atualiza      console.log('updated:', updated );

  this.salvarCompromisso(updated);
}

// Formata a hora para 'HH:mm'
formatHour(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

getDropListId(day: Date, hour: string, minute: number): string {
  return `${day.toISOString()}_${hour}_${minute}`;
}

trackByHour(index: number, hour: string) {
  return hour;
}

trackByMinute(index: number, minute: number): number {
  return minute;
}

getDropListData(day: Date, hour: string, minute: number) {
  return {
    day: new Date(day),  // cria nova instância para evitar referência
    hour: String(hour),  // força string
    minute: Number(minute)  // força número
  };
}

}

function buildDateWithTime(baseDay: Date, hour: string, minute: number): Date {
  const [h, m] = hour.split(':').map(Number);
  const result = new Date(baseDay);
  result.setHours(h, minute, 0, 0);
  return result;
}


