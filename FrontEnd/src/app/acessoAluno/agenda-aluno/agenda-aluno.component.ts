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
import { AgendaStatusSheetComponent } from '../../agenda/agenda-status-sheet/agenda-status-sheet.component'; // ajuste o caminho
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { DescricaoDialogComponent } from '../../agenda/descricao-dialog/descricao-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { Local } from '../../models/local.model';
import { Equipto } from '../../models/equipto.model';
import { Servico } from '../../models/servico.model';
import { Appointment } from '../../models/appointment'; // ajuste o caminho conforme sua estrutura
import { AgendaTreinoComponent } from '../../agenda/agenda-treino/agenda-treino.component'
import { AgendaTreinoService } from '../../services/agendaTreino.service';
import { AgendaTreino } from '../../models/agendaTreino.model';
import { MatSnackBar } from '@angular/material/snack-bar';

dayjs.extend(utc);
dayjs.extend(timezone);


@Component({
  selector: 'app-agenda-aluno',
  templateUrl: './agenda-aluno.component.html',
  styleUrls: ['./agenda-aluno.component.css'],
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatTableModule, MatProgressSpinnerModule, MatFormFieldModule, 
            MatInputModule, MatDatepickerModule, MatNativeDateModule, CommonModule, MatCheckboxModule, FormsModule,
            MatDialogContent, MatSelectModule],
  })
 
export class AgendaAlunoComponent implements OnInit {

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
  agendaTreino!: AgendaTreino;
  mensagem: string="";
  alunoid: any=0;
  @ViewChild('monthPicker') monthPicker!: MatDatepicker<Date>;

  constructor(private agendaService: AgendaService, private authService: AuthService,  private agendaStatusService: AgendaStatusService,
              private cd: ChangeDetectorRef, private personalService: PersonalService, private bottomSheet: MatBottomSheet, 
              private http: HttpClient, private dialog: MatDialog, private agendaTreinoService: AgendaTreinoService, private snackBar: MatSnackBar
  ) {}

  

  ngOnInit(): void {
    this.alunoid = this.authService.getAlunoId();
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
    this.gerarListaMeses();

    forkJoin({
      /*config: this.loadPersonal(),*/
      status: this.loadAgendaStatus(),
      locais: this.loadLocals(),
      equips: this.loadEquiptos(),
      servis: this.loadServicos(),
    }).subscribe(() => {
      this.carregarAulas();
      setTimeout(() => this.cd.markForCheck());
    });

    console.log('agenda status:', this.agendaStatus);
  }

  private carregarAulas() {
    if (!this.alunoid) {
      this.dataSource.data = [];
      return;
    }
    const alunoid =this.alunoid;
    const ano = this.mesSelecionado.getFullYear();
    const mes1a12 = this.mesSelecionado.getMonth() + 1;

    const payload = {
      alunoid,
      ano,
      mes1a12
    }      

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
      console.log('aulas', this.dataSource.data);
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
    //console.log("entrou consulta status")
    return  this.agendaStatusService.getStatus().pipe(
      tap(data => this.agendaStatus = data) // atualiza a variável
    );
  }

  getStatusCor(statusid: number): string {
    //console.log("statusid", statusid);
    //console.log(" cor", this.agendaStatus?.find(s => s.id === statusid)?.cor || 'transparent');
    return this.agendaStatus?.find(s => s.id === statusid)?.cor || 'transparent';
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
    this.abrirMenuStatusFull(row, row.date, row.hour, row.minute);
  }

  abrirMenuStatusFull(appt: any, day: Date, hour: string, minute: number) {
    console.log('entrou no abrirMenuStatus.');
    const ref = this.bottomSheet.open(AgendaStatusSheetComponent, {
      data: appt,
      autoFocus: false
    });

    ref.afterDismissed().subscribe(result => {
      if (!result) return;

      console.log('result.action.', result.action);      
      if (result.action === 'descricao') {
        this.editarDescricao(appt);
      } else if (result.action === 'treino') {
        this.abrirTreino(appt.agenda_id, appt.aluno, appt.date, appt.hour);
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
        this.http.put(`${environment.apiUrl}/agenda/agendaStatus`, updated, { headers }).subscribe({
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

  abrirTreino(agendaId: number, aluno: string, dataAg: Date, hour: string) {
    //
    this.agendaTreinoService.getTreino(agendaId)
      .subscribe((res: any) => {

        if (!res || res.length === 0) {

          this.mensagem = 'Nenhum treino encontrado para esta agenda.';

          this.snackBar.open(this.mensagem, 'Fechar', {
            duration: 5000,
            panelClass: ['snackbar-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });

          return;
        }

        console.log("res", res);

        this.agendaTreino = res;

        console.log("agendaTreino", this.agendaTreino);

        this.dialog.open(AgendaTreinoComponent, {
          width: '600px',
          panelClass: 'agendaTreino',
          data: {
            agendaTreino: this.agendaTreino,
            aluno,
            dataAg,
            hour
          }
        });

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
        aluno: appt.aluno,
        dataAg: appt.date,
        hour: appt.hour
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
      }
    });
  }


  
  loadLocals(): Observable<any[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({Authorization: `Bearer ${token}` });    
    return this.http.get<Local[]>(`${environment.apiUrl}/local/locals`, {headers})
    .pipe(
      tap(data => this.locals = data)
    );
  }

  loadEquiptos(): Observable<any[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({Authorization: `Bearer ${token}` });    
    return this.http.get<Equipto[]>(`${environment.apiUrl}/equipto/equiptos`, {headers})
        .pipe(
      tap(data => this.equiptos = data)
    );
  }

  loadServicos(): Observable<any[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({Authorization: `Bearer ${token}` });    
    return this.http.get<Servico[]>(`${environment.apiUrl}/servico/servicos`, {headers})
        .pipe(
      tap(data => this.servicos = data)
    );
  }
}


  function asDate(v: string | Date | null | undefined): Date {
    return v instanceof Date ? v : new Date(String(v));
  }
