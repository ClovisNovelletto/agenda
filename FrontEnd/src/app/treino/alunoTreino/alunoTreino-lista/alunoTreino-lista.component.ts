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
import { AuthService } from '../../../auth.service';

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
import { MonthPickerInlineComponent } from '../../../shared/monthpickerinline/monthpickerinline.component';
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { AlunoTreinoService } from '../../../services/alunoTreino.service';
import type { Aluno } from '../../../models/aluno.model';
import { AlunoTreinoFormComponent } from '../../alunoTreino/alunoTreino-form/alunoTreino-form.component';
import { AlunoTreino } from '../../../models/alunoTreino.model';
import { MatTooltipModule } from '@angular/material/tooltip'; // <-- Importe aqui

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-alunoTreino-lista',
  templateUrl: './alunoTreino-lista.component.html',
  styleUrls: ['./alunoTreino-lista.component.css'],
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatTableModule, MatProgressSpinnerModule, MatFormFieldModule, 
            MatInputModule, MatDatepickerModule, MatNativeDateModule, CommonModule, MatCheckboxModule, FormsModule,
            MatSelectModule, MatTooltipModule, DragDropModule, MatDialogContent],
  })
 
export class AlunoTreinoListaComponent implements OnInit {

  alunos: Aluno[] = [];
  alunoSelecionado?: Aluno;
  displayedColumns = ['data', 'titulo', 'treino'];
  displayedHeaderColumns = ['data', 'titulo', 'treino'];
  
  carregandoAlunos = false;
    personalid : number | null = null;

  alunoTreinos: AlunoTreino[] = [];
  alunoTreinosFiltrados: AlunoTreino[] = [];
  carregandoAlunosTreinos = false;
  ordemCrescente = true;
  dataSource = new MatTableDataSource<AlunoTreino>([]);
  isMobile: boolean = false;
  //currentDate: Date = dayjs.utc().tz('America/Sao_Paulo').toDate();

  // mês selecionado: sempre o primeiro dia do mês
  mesSelecionado = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  mesSelecionadoLabel: any;
  //mesesDisponiveis: { label: string, dataInicio: Date, dataFim: Date }[] = [];
  mesFormatado: String = '';
  meses: { label: string, dataInicio: Date, dataFim: Date }[] = [];

  @ViewChild('monthPicker') monthPicker!: MatDatepicker<Date>;

  constructor(private alunoTreinoService: AlunoTreinoService, private authService: AuthService,
              private cd: ChangeDetectorRef, private bottomSheet: MatBottomSheet, 
              private http: HttpClient, private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 768; // ajustável conforme seu layout
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 768;
        this.isMobile = window.innerWidth <= 768;
    });

    this.gerarListaMeses();
    this.atualizarMesFormatado();
    this.carregarAlunos();
   
  }


  private carregarAlunos() {
    //const personalid = this.authService.getPersonalid();
    this.carregandoAlunos = true;
    console.log("carregar alunos:");
    this.alunoTreinoService.getAlunosAtivos(this.personalid!)
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
      console.log("this.alunos:",this.alunos);
  }

  selecionarAluno(aluno: Aluno) {
    if (!aluno || this.alunoSelecionado?.id === aluno.id) return;
    this.alunoSelecionado = aluno;
    this.carregarAlunosTreinos();

    this.displayedColumns = ['treino', 'dataini', 'datafim', 'ativo'];
    this.displayedHeaderColumns = ['treino', 'dataini', 'fim', 'ativo'];
    console.log("alunoselecionado", this.alunoSelecionado);
    console.log("dataSource", this.dataSource.data);
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


  alunoTreinosEditar(alunoTreinos: AlunoTreino) { 
    const isMobile = window.innerWidth < 600;
    console.log('alunoTreinos: ', alunoTreinos);
    const dialogRef = this.dialog.open(AlunoTreinoFormComponent, {
      data: {alunoTreinos},
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log("resultado", resultado);
        this.alunoTreinoService.salvar(resultado).subscribe(() => this.carregarAlunosTreinos());
      }
    });
  }

  carregarAlunosTreinos() {
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

    this.carregandoAlunosTreinos = true;
            
    this.carregandoAlunosTreinos = true;
    this.alunoTreinoService.carregaAlunosTreinos(payload)
      .pipe(finalize(() => this.carregandoAlunosTreinos = false))
      .subscribe({
        next: (alunoTreinos: any) => {
          // ordena por ordem
          const ord = [...alunoTreinos].sort(
            (a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0)
          );
          this.dataSource.data = ord;
        },
        error: (e: any) => {
          console.error('Erro ao carregar alunoTreinos', e);
          this.dataSource.data = [];
        }
      });

  }

  novoAlunosTreinos() {
    const alunoid =this.alunoSelecionado?.id;
    const isMobile = window.innerWidth < 600; 
    const dialogRef = this.dialog.open(AlunoTreinoFormComponent, {
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : '',
      data : {alunoid: alunoid}
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.alunoTreinoService.salvar(resultado).subscribe(() => this.carregarAlunosTreinos());
      }
    });
  }

  salvarOrdemTreinos(lista: any[]) {
    console.log("lista: " + lista);
    this.alunoTreinoService.atualizarOrdemTreinos(lista).subscribe({
      next: () => console.log('Ordem salva'),
      error: err => console.error(err)
    });
    //return this.http.put('/api/treino-itens/ordem', lista);
  }


  drop(event: CdkDragDrop<AlunoTreino[]>) {
    console.log("AlunoTreino: " + event);

    //dataSource = new MatTableDataSource<TreinoItem>();
    const data = this.dataSource.data as AlunoTreino[];
    //const data = this.dataSource.data;

    console.log("Data: " + data);

    moveItemInArray(data, event.previousIndex, event.currentIndex);

    console.log("Data2: " + data);
    // 🔥 atualiza ordem antes de salvar
    data.forEach((item, index) => {
      console.log("item.ordem: " + item.ordem);
      item.ordem = (index + 1) * 10;
      console.log("item.ordem Nova: " + item.ordem);
    });

    console.log("Data3: " + data);
    this.dataSource.data = [...data];

    this.salvarOrdemTreinos(data);
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
}