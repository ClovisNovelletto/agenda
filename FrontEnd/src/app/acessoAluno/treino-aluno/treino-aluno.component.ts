import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDatepicker } from '@angular/material/datepicker';
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
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { AgendaTreinoService } from '../../services/agendaTreino.service';
import type { Aluno } from '../../models/aluno.model';
import { AgendaTreinoAluno } from '../../models/agendaTreinoAluno.model';
import { MatTooltipModule } from '@angular/material/tooltip'; // <-- Importe aqui

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { AgendaTreinoComponent } from '../../agenda/agenda-treino/agenda-treino.component'
import { AgendaTreino } from '../../models/agendaTreino.model';
import { MatSnackBar } from '@angular/material/snack-bar';
dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-treino-aluno',
  templateUrl: './treino-aluno.component.html',
  styleUrls: ['./treino-aluno.component.css'],
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatTableModule, MatProgressSpinnerModule, MatFormFieldModule, 
            MatInputModule, MatDatepickerModule, MatNativeDateModule, CommonModule, MatCheckboxModule, FormsModule,
            MatSelectModule, MatTooltipModule, DragDropModule, MatDialogContent],
  })
 
export class TreinoAlunoComponent implements OnInit {

  displayedColumns = ['data', 'treino', 'concluido'];
  displayedHeaderColumns = ['data', 'treino', 'concluido'];
  
  agendaTreinoAluno: AgendaTreinoAluno[] = [];
    carregandoAlunosTreinos = false;
  ordemCrescente = true;
  dataSource = new MatTableDataSource<AgendaTreinoAluno>([]);
  isMobile: boolean = false;
  //currentDate: Date = dayjs.utc().tz('America/Sao_Paulo').toDate();

  // mês selecionado: sempre o primeiro dia do mês
  mesSelecionado = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  mesSelecionadoLabel: any;
  //mesesDisponiveis: { label: string, dataInicio: Date, dataFim: Date }[] = [];
  mesFormatado: String = '';
  meses: { label: string, dataInicio: Date, dataFim: Date }[] = [];
  alunoid: any =0;
  agendaTreino!: AgendaTreino;
  mensagem: string="";
  @ViewChild('monthPicker') monthPicker!: MatDatepicker<Date>;

  constructor(private agendaTreinoService: AgendaTreinoService, private authService: AuthService,
              private cd: ChangeDetectorRef, private bottomSheet: MatBottomSheet, 
              private http: HttpClient, private dialog: MatDialog, private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.alunoid = this.authService.getAlunoId();
    this.isMobile = window.innerWidth <= 768; // ajustável conforme seu layout
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 768;
        this.isMobile = window.innerWidth <= 768;
    });

    this.gerarListaMeses();
    this.atualizarMesFormatado();
    this.carregarAlunosTreinos();
  }


  toDate(str: string): Date {
    return dayjs(str).toDate(); // Garante que retorna um objeto Date válido
  }

  fechar() {
    // navegação/close conforme sua app
    window.history.back();
  }

  trackByAlunoId(index: number, aluno: any): number {
    return aluno.id;
  }

  formatMonthYear = (date: Date | null): string => {
    return date ? `${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}` : '';
  };


  carregarAlunosTreinos() {
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

    this.carregandoAlunosTreinos = true;
            
    this.carregandoAlunosTreinos = true;
    this.agendaTreinoService.getAgendaTreinoAluno(payload)
      .pipe(finalize(() => this.carregandoAlunosTreinos = false))
      .subscribe({
        next: (agendaTreinoAluno: any) => {
          // ordena por ordem
          const ord = [...agendaTreinoAluno].sort(
            (a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0)
          );
          this.dataSource.data = ord;
        },
        error: (e: any) => {
          console.error('Erro ao carregar AgendaTreinoAluno', e);
          this.dataSource.data = [];
        }
      });

  }

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

    this.carregarAlunosTreinos();
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


  treino(receb: any){
    console.log(receb);
    const agendaid = receb.agendaid;
    const aluno = receb.aluno;
    const dataAg = receb.data;
    const hour = receb.hour;
    this.abrirTreino(agendaid, aluno, dataAg, hour);
    //this.carregarAlunosTreinos();  
  }

  abrirTreino(agendaId: number, aluno: string, dataAg: Date, hour: string) {

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

      this.agendaTreino = res;

      const dialogRef = this.dialog.open(AgendaTreinoComponent, {
        width: '600px',
        panelClass: 'agendaTreino',
        data: {
          agendaTreino: this.agendaTreino,
          aluno,
          dataAg,
          hour
        }
      });

      dialogRef.afterClosed().subscribe(() => {
        this.carregarAlunosTreinos();
      });

    });
}
}