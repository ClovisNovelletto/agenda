import { ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, ChangeDetectionStrategy } from '@angular/core';
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
import { Equipto } from '../models/equipto.model';
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
import { AgendaStatusService } from '../services/agenda-status.service';
import { AgendaStatus } from '../models/agendaStatus.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AgendaStatusSheetComponent } from '../agenda-status-sheet/agenda-status-sheet.component'; // ajuste o caminho

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatDatepickerInput} from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

import { DialogGerarAgendaComponent } from './dialog-gerar-agenda/dialog-gerar-agenda.component'; // ajuste o caminho
import { BehaviorSubject } from 'rxjs';
import { AppointmentsFiltradosPorPipe } from '../pipes/appointments-filtrados-por.pipe';
import { ChangeDetectorRef } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

dayjs.extend(utc);
dayjs.extend(timezone);
@Component({
  standalone: true,
  selector: 'app-agenda',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
    AppointmentsFiltradosPorPipe,
    MatIconModule,
  //  Configuracoes,
  ],
  providers: [MatDatepickerModule]

 
})
export class AgendaComponent implements OnInit, AfterViewInit {
  @ViewChildren(CdkDropList) dropLists!: QueryList<CdkDropList>;
  connectedDropLists: CdkDropList[] = [];
  weekDates: Date[] = [];
  hours: string[] = [];
  alunos: Aluno[] = [];
  locals: Local[] = [];
  equiptos: Equipto[] = [];
  personals: Personal[] = [];
  personal?:  Personal;
  agendaStatus: AgendaStatus[] = [];
  selectedAlunoId: number | null = null;
  selectedLocalId: number | null = null;
  selectedPersonalId: number | null = null;
  appointments: Appointment[] = [];
  appointments$ = new BehaviorSubject<Appointment[]>([]);
  //readonly minutes: number[] = [0, 10, 20, 30, 40, 50];
  minutes: number[]=[];
  hoveredCell: string | null = null;
  isDragging = false;
  draggedAppointment: any = null
  carregamentosFeitos: { dataInicio: Date, dataFim: Date }[] = [];
  
  mostrarSeletorMes = false;
  anoSelecionado: Date | null = null;
  dataAtual = new Date();
  minData = new Date(2024, 0); // Janeiro 2024
  maxData = new Date(2030, 11); // Dezembro 2030
  mesesDisponiveis: { label: string, dataInicio: Date, dataFim: Date }[] = [];
  mesSelecionado: any = null;

  configAgenda: ConfigAgenda = {
    diasAtendimento: [],
    horaInicio: 8,
    horaFim: 18,
    intervaloMinutos: 10,
    mostrarLocal: true,
    mostrarServico: true,
    mostrarEquipto: true,    
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
  //currentDate: Date = new Date();    
  currentDate: Date = dayjs.utc().tz('America/Sao_Paulo').toDate();
  week: Date[] = [];
  isMobile: boolean = false;
  dropListIds: string[] = [];

  constructor(private dialog: MatDialog, private http: HttpClient, private personalService: PersonalService, private agendaStatusService: AgendaStatusService, private bottomSheet: MatBottomSheet, private snackBar: MatSnackBar, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.gerarListaMeses();
    // Define o mês atual como selecionado
    const hoje = dayjs();
    const atual = this.mesesDisponiveis.find(m =>
      dayjs(m.dataInicio).isSame(hoje, 'month')
    );
    if (atual) {
      this.mesSelecionado = atual;
    }
    console.log('atual:', atual);
    console.log('this.mesSelecionado:', this.mesSelecionado);
    dayjs.extend(utc)
    dayjs.extend(timezone)
    const dataUTC = '2025-06-03T08:00:00Z';

    const localDate = dayjs.utc(dataUTC).tz('America/Sao_Paulo');

    console.log('Formatado:', localDate.format('YYYY-MM-DD HH:mm'));
    console.log('Objeto Date:', localDate.toDate());
    console.log('AgendaComponent iniciado');
    this.isMobile = window.innerWidth <= 768; // ajustável conforme seu layout
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 768;
        this.isMobile = window.innerWidth <= 768;
    });
    //const today = new Date();
    const today = dayjs.utc().tz('America/Sao_Paulo').toDate();

    this.loadPersonal().subscribe(config => {
      this.configAgenda = config;
      console.log('configAgenda init dentro loald:', this.configAgenda);
      console.log('this.configAgenda.diasAtendimento.length:', this.configAgenda.diasAtendimento.length);
      this.generateMinutes(); // gerar os minutos corretamente
      this.generateAllDropListIds(); // agora com os minutos corretos
      this.generateWeek();           // se também depende disso
      this.generateHours();
      this.loadAgendaStatus();
      this.loadAppointments();    
      this.loadAlunos();
      this.loadLocals();
      this.loadEquiptos();
      setTimeout(() => {
        this.cd.markForCheck();
      });
    });
  }

  gerarListaMeses() {
    const hoje = dayjs();
    this.mesesDisponiveis = [];

    for (let i = -6; i <= 6; i++) {
      const data = hoje.add(i, 'month');
      const inicio = data.startOf('month').toDate();
      const fim = data.endOf('month').toDate();
      const label = data.format('MMMM [de] YYYY'); // Ex: Julho de 2025

      this.mesesDisponiveis.push({
        label,
        dataInicio: inicio,
        dataFim: fim
      });
    }
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

  generateWeek(): void {
    console.log('entrou generateWeek');
    //const baseDate = new Date(this.currentDate);
    const baseDate = dayjs.utc(this.currentDate).tz('America/Sao_Paulo').toDate();
    //const startOfWeek = new Date(baseDate);
    const startOfWeek = dayjs.utc(baseDate).tz('America/Sao_Paulo').toDate();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Domingo (0)

    this.week = this.configAgenda.diasAtendimento.map(dia => {
      //const date = new Date(startOfWeek);
      const date = dayjs.utc(startOfWeek).tz('America/Sao_Paulo').toDate();
      date.setDate(startOfWeek.getDate() + dia); // Pula direto para o dia desejado
      date.setHours(0, 0, 0, 0);
      return date;
    });
    //this.appointments$.next(this.appointments$.value);
    this.appointments$.next([...this.appointments$.value]);
    //    this.appointments$.subscribe(appts => {
    //      console.log('Quantidade de compromissos:', appts.length);
    //    });
  }

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

  loadAgendaStatus(): void {
        this.agendaStatusService.getStatus().subscribe(res => {
        this.agendaStatus = res;
      console.warn('agendaStatus load :', this.agendaStatus);    
      });
  }

  loadAppointments() {
    const semanas = [-14, -7, 0, 7, 14]; // dias de deslocamento

    for (const dias of semanas) {
      const base = dayjs(this.currentDate).add(dias, 'day');
      const inicio = base.startOf('week').toDate();
      const fim = base.endOf('week').toDate();

      if (!this.periodoJaCarregado(inicio, fim)) {
        this.carregarAgendaPeriodo(inicio, fim);
      }
    }
  }

  /*loadAppointments() {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({Authorization: `Bearer ${token}` });
    this.http.get<any[]>(`${environment.apiUrl}/agendas`, {headers}).subscribe((data) => {
      const mapped = data.map((item) => ({
        agenda_id: item.agenda_id,
        date: dayjs(item.date).toDate(),
        start: dayjs(item.start).toDate(),
        hour: item.hour,
        titulo: item.titulo,
        alunoId: item.alunoid,
        aluno: item.aluno,
        localId: item.localid,
        local: item.local,
        personalId: item.personalid,
        statusId: item.statusid ?? 1
      }));
      this.appointments$.next(mapped); // Agora dispara re-render
    });
  }*/

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
    this.http.get<Local[]>(`${environment.apiUrl}/locals`, {headers}).subscribe((locals) => {
      this.locals = locals;
    });
  }

  loadEquiptos(): void {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({Authorization: `Bearer ${token}` });    
    this.http.get<Equipto[]>(`${environment.apiUrl}/equiptos`, {headers}).subscribe((equiptos) => {
      this.equiptos = equiptos;
    });
  }

  generateDropListId(day: Date, hour: string, minute: number): string {
    return `${day.toDateString()}-${hour}-${minute}`;
  }

  nextWeek() {
    console.log('entrou nextWeek');
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.generateWeek();

    const inicioSemana = this.week[0];
    const fimSemana = this.week[this.week.length - 1];

    if (!this.periodoJaCarregado(inicioSemana, fimSemana)) {
      console.log('vai chamar carregamento ini', inicioSemana);
      console.log('vai chamar carregamento fim', fimSemana);
      //this.appointments$.next(this.appointments$.value);
      this.carregarAgendaPeriodo(inicioSemana, fimSemana);
    }
  }

  previousWeek() {
    console.log('entrou previousWeek');
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.generateWeek();
    
    const inicioSemana = this.week[0];
    const fimSemana = this.week[this.week.length - 1];

    if (!this.periodoJaCarregado(inicioSemana, fimSemana)) {
      //this.appointments$.next(this.appointments$.value);
      this.carregarAgendaPeriodo(inicioSemana, fimSemana);
    }
  }

  getAppointments(day: Date, hour: string, minute: number): Appointment[] {
    //const target = new Date(day);
    const target = dayjs.utc(day).tz('America/Sao_Paulo').toDate();
    const [h] = hour.split(':');
    target.setHours(+h, minute, 0, 0);

    return this.appointments.filter(appt => {
      //const apptDate = new Date(appt.start);
      const apptDate = dayjs.utc(appt.start).tz('America/Sao_Paulo').toDate();
      return apptDate.getTime() === target.getTime();
    });
  }


  openAppointmentModal(day: Date, hour: string, minute: number) {
    const [h] = hour.split(':');
    //const start = new Date(day);
    const start = dayjs.utc(day).tz('America/Sao_Paulo').toDate();
    start.setHours(+h, minute, 0, 0);

console.log("this.locals ag: ", this.locals)            
console.log("this.equiptos ag: ", this.equiptos)      


    console.log('this.configAgenda.intervaloMinutos antess', this.configAgenda.intervaloMinutos);
    const dialogRef = this.dialog.open(AppointmentDialogComponent, {
      width: '300px',
      data: {
        date: start,
        hour: hour, // 👈 Adicione isso!
        alunos: this.alunos,
        locals: this.locals,
        equiptos: this.equiptos,
        mostrarEquipto: this.configAgenda.mostrarEquipto,
        personalId: 1,//this.personalId // ajuste conforme o nome do id do personal
        intervalo: this.configAgenda?.intervaloMinutos ?? 10,  // 👈 Aqui passa o intervalo
        horaInicio: this.configAgenda.horaInicio,
        horaFim: this.configAgenda.horaFim,
      }
    });
    console.log('this.configAgenda.intervaloMinutos depois ', this.configAgenda.intervaloMinutos);
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.atualizouAlunos && result.aluno) {
        const jaExiste = this.alunos.some(a => a.id === result.aluno.id);
        console.log('afterClosedo openAppointmentModal antes',  this.alunos);      
        if (!jaExiste) {
          this.alunos.push(result.aluno);
        }
      console.log('afterClosedo openAppointmentModal depois',  this.alunos);      
      }
      console.log('result',  result);      
      if (result?.atualizouLocals && result.local) {
        console.log('afterClosedo openAppointmentModal antes',  this.locals);      
        const jaExiste = this.locals.some(a => a.id === result.local.id);
        if (!jaExiste) {
          this.locals.push(result.local);
        }
        console.log('afterClosedo openAppointmentModal depois',  this.locals);
      }    
      if (result?.titulo) {
        //const start = new Date(day);
        const start = dayjs.utc(day).tz('America/Sao_Paulo').toDate();
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
          result.statusId ?? 1,
          result.servicoId,
          result.servico,
          result.equiptoId,
          result.equipto,
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
        console.log('entrou salvarCompromisso!');

    //console.log('comp', comp);

      // Cria um objeto Date com a data que já está no formato correto
      //const dataCompleta = new Date(comp.date);
      const dataCompleta = dayjs.utc(comp.date).tz('America/Sao_Paulo').toDate();

    const compromisso = {
      /*personalId: comp.personalId,*/ // opcional se já vem do token
      agenda_id: comp.agenda_id,
      alunoId: comp.alunoId,
      localId: comp.localId,
      data: comp.date,
      /*hora: comp.hour,*/
      titulo: comp.titulo,
      //descricao: comp.descricao,
      statusId: comp.statusId ?? 1,/*'agendado' // padrão*/
      servicoId: comp.servicoId,
      equiptoId: comp.equiptoId,
    };

    console.log('Compromisso dados enviados!');
    //console.log(compromisso);

    if (comp.agenda_id) {
      /*this.http.put('/api/agendas', compromisso, { headers }).subscribe({*/
      this.http.put(`${environment.apiUrl}/agendas`, compromisso, { headers }).subscribe({
        next: () => {
          console.log('Compromisso atualizado com sucesso!');
          // Aqui você pode recarregar a agenda ou dar feedback ao usuário
          // Atualiza localmente:
          
          // Atualiza tela sem carregar dados
          const atual = this.appointments$.getValue();
          const idx = atual.findIndex(a => a.agenda_id === comp.agenda_id);
          if (idx !== -1) {
            atual[idx] = {
              ...atual[idx],
              date: comp.date, 
              start: comp.date, 
              alunoId: comp.alunoId,
              localId: comp.localId,
              titulo: comp.titulo,
              statusId: comp.statusId,
              servicoId: comp.servicoId,
              equiptoId: comp.equiptoId
            };
            this.appointments$.next([...atual]);
          }

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

  getStatusCor(statusId: number): string {
    //console.warn('statusId:', statusId);
    //console.warn('agendaStatus get:', this.agendaStatus);
    return this.agendaStatus?.find(s => s.id === statusId)?.cor || 'transparent';
  }

  getDateTime(appt: Appointment): Date {
    if (!appt?.hour || !appt?.date) {
      console.warn('Compromisso incompleto:', appt);
      //return new Date(); // ou null, dependendo do que você quiser exibir
      return dayjs.utc().tz('America/Sao_Paulo').toDate();
    }

    const [h, m] = appt.hour.split(':');
    //const date = new Date(appt.date);
    const date = dayjs.utc(appt.date).tz('America/Sao_Paulo').toDate();
    date.setHours(+h, +m);
    return date;
  }


  formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }


  hasAppointment(day: Date, hour: string, minute: number): boolean {
    //const target = new Date(day);
    const target = dayjs.utc(day).tz('America/Sao_Paulo').toDate();
    const [h] = hour.split(':');
    target.setHours(+h, minute, 0, 0);
  //console.log('Verificando:', target.toISOString());
    return this.appointments.some(appt => {
      //const apptDate = new Date(appt.start); // usando `start` agora
      const apptDate = dayjs.utc(appt.start).tz('America/Sao_Paulo').toDate();
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
    //const safeDate = new Date(Date.parse(appt.date));
    const safeDate = dayjs.utc(Date.parse(appt.date)).tz('America/Sao_Paulo').toDate();
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
        equiptos: this.equiptos,
        mostrarEquipto: this.configAgenda.mostrarEquipto,
        intervalo: this.configAgenda?.intervaloMinutos ?? 10,  // 👈 Aqui passa o intervalo
        horaInicio: this.configAgenda.horaInicio,
        horaFim: this.configAgenda.horaFim,
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
      if (result?.atualizouLocals && result.local) {
        console.log('afterClosedo editarCompromisso antes',  this.locals);      
        const jaExiste = this.locals.some(a => a.id === result.local.id);
        if (!jaExiste) {
          this.locals.push(result.local);
        }
      console.log('afterClosedo editarCompromisso depois',  this.locals);
      }    
      if (result?.titulo) {
        // Atualiza compromisso existente
        console.log('result x:', result );
        console.log('appt x:', appt );
        //alunoId, localId, data, /*hora,*/ titulo, /*descricao,*/ status 
        const updated = {
          agenda_id: appt.agenda_id,
          alunoId: result.alunoId,
          localId: result.localId,
          date: result.date,
          titulo: result.titulo,
          statusId: appt.statusId ?? 1,
          servicoId: appt.servicoId,
          equiptoId: appt.equiptoId,
        };
        console.log('appt z:', appt );
        console.log('updated z:', updated );
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
    const toDay = dayjs.utc(event.container.data.day).tz('America/Sao_Paulo').toDate();
    const hour = event.container.data.hour;
    const minute = event.container.data.minute;

    const fromDate = dayjs.utc(event.item.data.appointment.start).tz('America/Sao_Paulo').toDate();
    const toDate = buildDateWithTime(toDay, event.container.data.hour, event.container.data.minute);
    console.log("From:", fromDate, "|", fromDate.getTime());
    console.log("To:", toDate, "|", toDate.getTime());

    const sameDay = fromDate.toDateString() === toDate.toDateString();
    const sameTime = fromDate.getHours() === toDate.getHours() && fromDate.getMinutes() === toDate.getMinutes();

    if (sameDay && sameTime) {
      console.log('Sem alterações necessárias.');
      return;
    }

    const updated = {
      agenda_id: appt.agenda_id,
      alunoId: appt.alunoId,
      localId: appt.localId,
      date: toDate,
      titulo: appt.titulo,
      statusId: appt.statusId ?? 1,
      servicoId: appt.servicoId,
      equiptoId: appt.equiptoId,
    };
    //console.log('appt y:', appt );
    //console.log('updated y:', updated );

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

  trackByAppt(index: number, appt: Appointment) {
    return appt.agenda_id;
  }

  getDropListData(day: Date, hour: string, minute: number) {
    return {
      //day: new Date(day),  // cria nova instância para evitar referência
      day: dayjs.utc(day).tz('America/Sao_Paulo').toDate(),
      hour: String(hour),  // força string
      minute: Number(minute)  // força número
    };
  }

  abrirMenuStatus(appt: any, day: Date, hour: string, minute: number) {
    console.log('entrou no abrirMenuStatus.');
    const ref = this.bottomSheet.open(AgendaStatusSheetComponent, {
      data: appt
    });

    ref.afterDismissed().subscribe(result => {
      if (!result) return;

      console.log('result.action.', result.action);      
      if (result.action === 'editar') {
        this.editarCompromisso(appt);
      } else if (result.action === 'status' && appt.statusId != result.statusId) {
        const statusId = result.statusId ?? 1;
        console.log('appt:', appt);
        console.log('status antigo:', appt.statusId);
        console.log('status novo:', result.statusId);

        const updated = {
          agenda_id: appt.agenda_id,
          statusId: result.statusId ?? 1,
        };

        const token = localStorage.getItem('jwt-token');
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        this.http.put(`${environment.apiUrl}/agendaStatus`, updated, { headers }).subscribe({
          next: () => {
            console.log('Compromisso atualizado com sucesso!');
            // Aqui você pode recarregar a agenda ou dar feedback ao usuário
            //Atualizar status da tela sem carregar
                      // Atualiza tela sem carregar dados
            const atual = this.appointments$.getValue();
            const idx = atual.findIndex(a => a.agenda_id === updated.agenda_id);
            console.log('idx:', idx);
            if (idx !== -1) {
              atual[idx] = {
                ...atual[idx],
                statusId: updated.statusId
              };
              this.appointments$.next([...atual]);
            }
            //
            this.loadAppointments();
          },
          error: (err) => {
            console.error('Erro ao atualizar  compromisso:', err);
          }
        });

      }
    });
  }

  abrirSeletorMes() {
    this.mostrarSeletorMes = true;
  }

  //gerarAgenda(data: Date) {
  gerarAgenda(mesSelecionado: { dataInicio: Date, dataFim: Date }) {
    this.mostrarSeletorMes = false;

    const payload = {
      data_inicio: dayjs(mesSelecionado.dataInicio).format('YYYY-MM-DD'),
      data_fim: dayjs(mesSelecionado.dataFim).format('YYYY-MM-DD'),
    };
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.post(`${environment.apiUrl}/agendaGerar`, payload, { headers }).subscribe({
      next: () => {
        this.snackBar.open('Agenda gerada com sucesso!', 'Fechar', { duration: 3000 });
        this.appointments$.next([]);
        //this.appointments$ = new BehaviorSubject<Appointment[]>([]);
        this.loadAppointments(); // ⬅️ recarrega os dados após sucesso
      },
      error: err => {
        this.snackBar.open('Erro ao gerar agenda!', 'Fechar', { duration: 3000 });
      }
    });
  }

  abrirDialogoGerarAgenda() {
    const dialogRef = this.dialog.open(DialogGerarAgendaComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe((mesSelecionado) => {
      if (mesSelecionado) {
        this.gerarAgenda(mesSelecionado);
      }
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
    statusId: number,
    servicoId: number,
    servico: string,
    equiptoId: number,
    equipto: string,
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
      statusId,
      servicoId,
      servico,
      equiptoId,
      equipto,
      /*personalId*/
    };

    this.appointments.push(newAppointment);
    console.log('Novo compromisso salvo:', newAppointment);
  }

  periodoJaCarregado(inicio: Date, fim: Date): boolean {
    //console.log("inicio: ", inicio);
    //console.log("fim: ", fim);
    //console.log("this.carregamentosFeitos", this.carregamentosFeitos);
    //console.log(" this.carregamentosFeitos.some(p => inicio >= p.dataInicio && fim <= p.dataFim): ", this.carregamentosFeitos.some(p => inicio >= p.dataInicio && fim <= p.dataFim));
    return this.carregamentosFeitos.some(p => inicio >= p.dataInicio && fim <= p.dataFim);
  }

  carregarAgendaPeriodo(inicio: Date, fim: Date) {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const payload = {
      data_inicio: dayjs(inicio).format('YYYY-MM-DD'),
      data_fim: dayjs(fim).format('YYYY-MM-DD')
    };

    this.http.post<any[]>(`${environment.apiUrl}/agendaPorPeriodo`, payload, {headers}).subscribe(dados => {
      const novos = dados.map(item =>  ({
        agenda_id: item.agenda_id,
        date: dayjs(item.date).toDate(),
        start: dayjs(item.start).toDate(),
        hour: item.hour,
        titulo: item.titulo,
        alunoId: item.alunoid,
        aluno: item.aluno,
        localId: item.localid,
        local: item.local,
        personalId: item.personalid,
        statusId: item.statusid ?? 1,
        servicoId: item.servicoid,
        servico: item.servico,
        equiptoId: item.equiptoid,
        equipto: item.equipto,
      }));
      const atuais = this.appointments$.value;

      const mesclados = [
        ...atuais.filter(a => !novos.some(n => n.agenda_id === a.agenda_id)),
        ...novos
      ];

      this.appointments$.next(mesclados);

      //this.appointments$.next(novos); // Agora dispara re-render
      //this.appointmentsSubject.next([
      //  ...this.appointmentsSubject.value,
      //  ...novos
      //]);
      
      this.carregamentosFeitos.push({ dataInicio: inicio, dataFim: fim });
      const jaCarregado = this.carregamentosFeitos.some(p =>
        dayjs(inicio).isSame(p.dataInicio, 'day') &&
        dayjs(fim).isSame(p.dataFim, 'day')
      );

      if (jaCarregado) {
        return; // já foi carregado antes
      }
      this.cd.markForCheck();
      //console.log("this.carregamentosFeitos: ", this.carregamentosFeitos);
    });
  }

  onDragStarted(appt: any) {
  this.draggedAppointment = appt;
  this.isDragging = true;
  }

  onDragEnded() {
    this.draggedAppointment = null;
    this.isDragging = false;
  }
}

function buildDateWithTime(baseDay: Date, hour: string, minute: number): Date {
  const [h, m] = hour.split(':').map(Number);
  //const result = new Date(baseDay);
  const result = dayjs.utc(baseDay).tz('America/Sao_Paulo').toDate();
  result.setHours(h, minute, 0, 0);
  return result;
}


