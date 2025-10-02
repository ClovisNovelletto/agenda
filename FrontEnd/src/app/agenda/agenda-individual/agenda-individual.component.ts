import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDatepicker } from '@angular/material/datepicker';
import { AgendaService, Aluno, Aula, StatusAula } from '../../services/agenda-individual.service';
import { finalize } from 'rxjs/operators';

import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // ou MatMomentDateModule
import { AuthService } from '../../auth.service';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { AgendaStatus } from '../../models/agendaStatus.model';
import { AgendaStatusService } from '../../services/agenda-status.service';
import { ConfigAgenda } from '../../models/configAgenda.model';
import { Personal } from '../../models/personal.model';
import { PersonalService } from '../../services/personal.service';

import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { map } from 'rxjs/operators';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MonthPickerInlineComponent } from '../../shared/monthpickerinline/monthpickerinline.component';
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AgendaStatusSheetComponent } from '../agenda-status-sheet/agenda-status-sheet.component'; // ajuste o caminho
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { DescricaoDialogComponent } from './../descricao-dialog/descricao-dialog.component';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { Local } from '../../models/local.model';
import { Equipto } from '../../models/equipto.model';
import { Servico } from '../../models/servico.model';
import { Appointment } from '../../models/appointment'; // ajuste o caminho conforme sua estrutura


dayjs.extend(utc);
dayjs.extend(timezone);


@Component({
  selector: 'app-agenda-individual',
  templateUrl: './agenda-individual.component.html',
  styleUrls: ['./agenda-individual.component.css'],
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatTableModule, MatProgressSpinnerModule, MatFormFieldModule, 
            MatInputModule, MatDatepickerModule, MatNativeDateModule, CommonModule, MatCheckboxModule, FormsModule,
            MatDialogContent, MatSelectModule],
  })
 
export class AgendaIndividualComponent implements OnInit {

  meses: { label: string, dataInicio: Date, dataFim: Date }[] = [];
  // ajuste conforme seu login/sessão

  agendaStatus: AgendaStatus[] = [];
  alunos: Aluno[] = [];
  alunoSelecionado?: Aluno;
  locals: Local[] = [];
  equiptos: Equipto[] = [];
  servicos: Servico[] = [];
  displayedColumns = ['data', 'equipto', 'descricao'];
  displayedHeaderColumns = ['data', 'equipto', 'descricao'];
  dataSource = new MatTableDataSource<Aula>([]);
  carregandoAlunos = false;
  carregandoAulas = false;
  personalid : number | null = null;
  personals: Personal[] = [];
  personal?:  Personal;
  // mês selecionado: sempre o primeiro dia do mês
  mesSelecionado = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  mesSelecionadoLabel: any;
  //mesesDisponiveis: { label: string, dataInicio: Date, dataFim: Date }[] = [];
  mesFormatado: String = '';


  configAgenda: ConfigAgenda = {
    diasAtendimento: [],
    horaInicio: 8,
    horaFim: 18,
    intervaloMinutos: 10,
    mostrarLocal: true,
    mostrarServico: true,
    mostrarEquipto: true,    
    servicoid: 23,
  };

  isMobile: boolean = false;
  mostrarEquipto: boolean = false;
  currentDate: Date = dayjs.utc().tz('America/Sao_Paulo').toDate();

  @ViewChild('monthPicker') monthPicker!: MatDatepicker<Date>;

  constructor(private agendaService: AgendaService, private authService: AuthService,  private agendaStatusService: AgendaStatusService,
              private cd: ChangeDetectorRef, private personalService: PersonalService, private bottomSheet: MatBottomSheet, 
              private http: HttpClient, private dialog: MatDialog
  ) {}

  

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 768; // ajustável conforme seu layout
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 768;
        this.isMobile = window.innerWidth <= 768;
    });
    console.log("isMobile", this.isMobile)
    const dataUTC = '2025-06-03T08:00:00Z';
    const localDate = dayjs.utc(dataUTC).tz('America/Sao_Paulo');
    dayjs.extend(utc)
    dayjs.extend(timezone)
    this.atualizarMesFormatado();
    this.loadPersonal().subscribe(config => {
      this.gerarListaMeses();
      this.personalid = this.authService.getPersonalId();
      this.configAgenda = config;
      console.log("this.personalid: ", this.personalid)
      agendaStatus : this.loadAgendaStatus();
      
      console.log("stats", this.agendaStatus);
      console.log("this.meses:",this.meses);
      forkJoin({
        /*config: this.loadPersonal(),*/
        status: this.loadAgendaStatus(),
        locais: this.loadLocals(),
        equips: this.loadEquiptos(),
        servis: this.loadServicos(),
      }).subscribe(() => {
        this.carregarAlunos();
        setTimeout(() => this.cd.markForCheck());
      });
    });
    
  }

  private carregarAlunos() {
    //const personalid = this.authService.getPersonalid();
    this.carregandoAlunos = true;
    this.agendaService.getAlunosAtivos(this.personalid!)
      .pipe(finalize(() => this.carregandoAlunos = false))
      .subscribe({
        next: (resp: any) => {
          this.alunos = resp;
          if (this.alunos.length && !this.alunoSelecionado) {
            this.selecionarAluno(this.alunos[0]);
          }
        },
        error: (e: any) => console.error('Erro ao carregar alunos', e)
      });
  }

  selecionarAluno(aluno: Aluno) {
    if (!aluno || this.alunoSelecionado?.id === aluno.id) return;
    this.alunoSelecionado = aluno;
    this.carregarAulas();
    if (this.alunoSelecionado?.mostrarEquipto) {
      this.displayedColumns = ['data', 'equipto', 'descricao'];
      this.displayedHeaderColumns = ['data', 'equipto', 'descricao'];
    } else {
      this.displayedColumns = ['data', 'descricao' ];
      this.displayedHeaderColumns = ['data', 'descricao'];
    }
    console.log("alunoselecionado", this.alunoSelecionado);
    console.log("dataSource", this.dataSource.data);
  }

  private carregarAulas() {
    if (!this.alunoSelecionado) {
      this.dataSource.data = [];
      return;
    }
    const alunoid =this.alunoSelecionado.id;
    const ano = this.mesSelecionado.getFullYear();
    const mes1a12 = this.mesSelecionado.getMonth() + 1;

    const payload = {
      alunoid,
      ano,
      mes1a12
    }      
//    const data_inicio: dayjs(this.mesSelecionado.dataInicio).format('YYYY-MM-DD');
//    const data_fim: dayjs(this.mesSelecionado.dataFim).format('YYYY-MM-DD');
/*
    this.http.post<any[]>(`${environment.apiUrl}/agendaPorPeriodo`, payload, {headers}).subscribe(dados => {
      const novos = dados.map(item =>  ({
        agenda_id: item.agenda_id,
        date: dayjs(item.date).toDate(),
        start: dayjs(item.start).toDate(),
*/        
    this.carregandoAulas = true;
    this.agendaService.getAulasDoAlunoMes(payload)
      .pipe(finalize(() => this.carregandoAulas = false))
      .subscribe({
        next: (aulas: any) => {
          date: dayjs(aulas.date).toDate();
          start: dayjs(aulas.start).toDate();
          // ordena por data/hora só pra garantir
          const ord = [...aulas].sort((a, b) => +new Date(a.dataHora) - +new Date(b.dataHora));
          this.dataSource.data = ord;
        },
        error: (e: any) => {
          console.error('Erro ao carregar aulas', e);
          this.dataSource.data = [];
        }
      });
  }

  // helpers de template
//  toDate(iso: string) { return new Date(iso); }
  horaStr(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  toDate(str: string): Date {
    return dayjs(str).toDate(); // Garante que retorna um objeto Date válido
  }

  rowClass(status: StatusAula) {
    switch (status) {
      case 'CONFIRMADA': return 'row--confirmada';
      case 'PENDENTE':   return 'row--pendente';
      case 'CANCELADA':  return 'row--cancelada';
      default:           return '';
    }
  }

  fechar() {
    // navegação/close conforme sua app
    window.history.back();
  }

  trackByAlunoId(index: number, aluno: any): number {
    return aluno.id;
  }

  loadAgendaStatus(): Observable<any[]> {
    console.log("entrou consulta status")
    return  this.agendaStatusService.getStatus().pipe(
      tap(data => this.agendaStatus = data) // atualiza a variável
    );
  }

  getStatusCor(statusid: number): string {
    //console.log("statusid", statusid);
    // console.log(" cor", this.agendaStatus?.find(s => s.id === statusid)?.cor || 'transparent');
    return this.agendaStatus?.find(s => s.id === statusid)?.cor || 'transparent';
  }

  loadPersonal(): Observable<ConfigAgenda> {
    return this.personalService.getMe().pipe(
      map((personal: Personal) => ({
        diasAtendimento: [0,1,2,3,4,5,6].filter(i => (personal as any)[`dia${i}`]),
        horaInicio: personal.hora_inicio,
        horaFim: personal.hora_fim,
        intervaloMinutos: personal.intervalo_minutos,
        mostrarLocal: personal.mostrarLocal,
        mostrarServico: personal.mostrarServico,
        mostrarEquipto: personal.mostrarEquipto,
        servicoid: personal.servicoid,
      }))
    );
  }

  formatMonthYear = (date: Date | null): string => {
    return date ? `${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}` : '';
  };


  onMonthSelected(event: any) {
    const mesSelecionado = event.value; // objeto { label, dataInicio, dataFim }

    // Já vem como Date porque você criou com .toDate()
    const dataInicio: Date = mesSelecionado.dataInicio;

    // Agora sim, cria o 1º dia do mês sem perder fuso
    const dtini = new Date(
      dataInicio.getFullYear(),
      dataInicio.getMonth(),
      1
    );

    this.mesSelecionado = dtini;

    console.log("dataInicio:", dataInicio);
    console.log("dtini:", dtini);
    console.log("this.mesSelecionado:", this.mesSelecionado);

    this.carregarAulas();
  }

  atualizarMesFormatado() {
    const mes = this.mesSelecionado.getMonth() + 1;
    const ano = this.mesSelecionado.getFullYear();
    this.mesFormatado = `${mes.toString().padStart(2, '0')}/${ano}`;
    console.log("this.mesFormatado", this.mesFormatado);
  }

  gerarListaMeses() {
    const hoje = dayjs();
    for (let i = -6; i <= 6; i++) {
      const data = hoje.add(i, 'month');
      const inicio = data.startOf('month').toDate();
      const fim = data.endOf('month').toDate();
      const label = data.format('MM/YYYY');
      const item = { label, dataInicio: inicio, dataFim: fim };
      this.meses.push(item);

      if (i === 0) this.mesSelecionadoLabel = item; // Seleciona o mês atual por padrão
    }
  }



  abrirMenuStatus(row: any) {
    console.log("row", row);
    row = normalizeAppt(row);
    console.log("row", row);
    this.abrirMenuStatusFull(row, row.date, row.hour, row.minute);
  }

  abrirMenuStatusFull(appt: any, day: Date, hour: string, minute: number) {
    console.log('entrou no abrirMenuStatus.');
    const ref = this.bottomSheet.open(AgendaStatusSheetComponent, {
      data: appt
    });

    ref.afterDismissed().subscribe(result => {
      if (!result) return;

      console.log('result.action.', result.action);      
      if (result.action === 'editar') {
        this.editarCompromisso(appt);
      } else if (result.action === 'descricao') {
        this.editarDescricao(appt);
      } else if (result.action === 'status' && appt.statusid != result.statusid) {
        const statusid = result.statusid ?? 1;
        console.log('appt:', appt);
        console.log('status antigo:', appt.statusid);
        console.log('status novo:', result.statusid);

        const updated = {
          agenda_id: appt.agenda_id,
          statusid: result.statusid ?? 1,
        };

        const token = localStorage.getItem('jwt-token');
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        this.http.put(`${environment.apiUrl}/agendaStatus`, updated, { headers }).subscribe({
          next: () => {
            console.log('Compromisso atualizado com sucesso!');
            this.carregarAulas();
          },
          error: (err) => {
            console.error('Erro ao atualizar  compromisso:', err);
          }
        });
      }
    });
  }


  editarDescricao(appt: any): void {
    agenda_id: appt.agenda_id,
    console.log('entrou no ediar descrição:');
    console.log('appt:', appt );
    //const safeDate = new Date(Date.parse(appt.date));
    const dialogRef = this.dialog.open(DescricaoDialogComponent, {
      width: '360px',
      data: {
        descricao: appt.descricao,
      }
    });
console.log('teste vai:');
    dialogRef.afterClosed().subscribe(descr => {
      console.log('agora é a volta:', descr );
      if (!(descr == null)) {
        // Atualiza compromisso existente
        console.log('result desc rx:', descr );
        console.log('appt descr x:', appt );
        const updated = {
          agenda_id: appt.agenda_id,
          descricao: descr
        };
        console.log('appt z:', appt );
        console.log('updated z:', updated );
        this.salvarDescricao(updated); // mesma função que salva novo ou atualiza
      }
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
      width: '360px',
      data: {
        date: safeDate,
        hour: appt.data, // se quiser passar como string também
        compromisso: appt,  // envia todos os dados do compromisso
        alunos: this.alunos,     // 👈 passa a lista
        locals: this.locals,     // 👈 passa a lista
        equiptos: this.equiptos,
        servicos: this.servicos,
        mostrarEquipto: this.configAgenda.mostrarEquipto,
        mostrarServico: this.configAgenda.mostrarServico,
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
      if (result?.aluno) {
        // Atualiza compromisso existente
        console.log('result x:', result );
        console.log('appt x:', appt );
        //alunoid, localid, data, /*hora,*/ titulo, /*descricao,*/ status 
        const updated = {
          agenda_id: appt.agenda_id,
          alunoid: result.alunoid,
          aluno: result.aluno,
          localid: result.localid,
          local: result.local,
          date: result.date,
          /*titulo: result.titulo,*/
          statusid: appt.statusid ?? 1,
          servicoid: appt.servicoid,
          servico: appt.servico,
          equiptoid: result.equiptoid,
          equipto: result.equipto,
        };
        console.log('appt z:', appt );
        console.log('updated z:', updated );
        this.salvarCompromisso(updated); // mesma função que salva novo ou atualiza
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
      /*personalid: comp.personalid,*/ // opcional se já vem do token
      agenda_id: comp.agenda_id ?? null,
      alunoid: comp.alunoid,
      localid: comp.localid,
      aluno: comp.aluno,
      local: comp.local,
      data: comp.date,
      /*hora: comp.hour,*/
      /*titulo: comp.titulo,*/
      //descricao: comp.descricao,
      statusid: comp.statusid ?? 1,/*'agendado' // padrão*/
      servicoid: comp.servicoid,
      servico: comp.servico,
      hour: comp.hour,
      equiptoid: comp.equiptoid,
      equipto: comp.equipto,
    };

    console.log('Compromisso dados enviados!');
    //console.log(compromisso);
console.log('comp:', comp);
    if (!(compromisso.agenda_id == null)) {
      /*this.http.put('/api/agendas', compromisso, { headers }).subscribe({*/
      this.http.put(`${environment.apiUrl}/agendas`, compromisso, { headers }).subscribe({
        next: () => {
          console.log('Compromisso atualizado com sucesso!');
          this.carregarAulas();
          // Aqui você pode recarregar a agenda ou dar feedback ao usuário
          // Atualiza localmente:
          
          // Atualiza tela sem carregar dados

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
        },
        error: (err) => {
          console.error('Erro ao inserir compromisso:', err);
        }
      });
    }
  }  

  
  salvarDescricao(comp: any): void {
    const token = localStorage.getItem('jwt-token');
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        console.log('entrou salvarDescricao!');

    const compromisso = {
      agenda_id: comp.agenda_id,
      descricao: comp.descricao,
    };

    console.log('Compromisso descrição dados enviados!');

    if (comp.agenda_id) {
      this.http.put(`${environment.apiUrl}/agendasDescricao`, compromisso, { headers }).subscribe({
        next: () => {
          this.carregarAulas();
          console.log('Compromisso atualizado com sucesso!');
          
          // Atualiza tela sem carregar dados
        },
        error: (err) => {
          console.error('Erro ao atualizar descrição compromisso:', err);
        }
      });
    }
  }

  loadLocals(): Observable<any[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({Authorization: `Bearer ${token}` });    
    return this.http.get<Local[]>(`${environment.apiUrl}/locals`, {headers})
    .pipe(
      tap(data => this.locals = data)
    );
  }

  loadEquiptos(): Observable<any[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({Authorization: `Bearer ${token}` });    
    return this.http.get<Equipto[]>(`${environment.apiUrl}/equiptos`, {headers})
        .pipe(
      tap(data => this.equiptos = data)
    );
  }

  loadServicos(): Observable<any[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({Authorization: `Bearer ${token}` });    
    return this.http.get<Servico[]>(`${environment.apiUrl}/servicos`, {headers})
        .pipe(
      tap(data => this.servicos = data)
    );
  }
}


  function asDate(v: string | Date | null | undefined): Date {
    return v instanceof Date ? v : new Date(String(v));
  }
  function normalizeAppt(a: Appointment): Appointment {
    return {
      agenda_id: a.agenda_id,// ?? a.agendaid,
      date: asDate(a.date),
      start: asDate(a.start),
      hour: a.hour,
      alunoid: a.alunoid ?? a.alunoid ?? null,
      aluno: a.aluno,
      equiptoid: a.equiptoid, // ?? a.equiptoid ?? null,
      equipto: a.equipto,
      statusid: a.statusid,// ?? a.statusid,
      localid: a.localid,
      local: a.local,
      servicoid: a.servicoid,
      servico: a.servico,
      descricao: a.descricao,  
      personalid: a.personalid
    };
  }