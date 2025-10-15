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
import { RecebimentosService } from '../../../services/recebimentos.service';
import type { Aluno } from '../../../models/aluno.model';
import { RecebimentosFormComponent } from '../recebimentos-form/recebimentos-form.component';
import { Recebimento } from '../../../models/recebimento.model';
import { MatTooltipModule } from '@angular/material/tooltip'; // <-- Importe aqui


dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-recebIndividual-lista',
  templateUrl: './recebIndividual-lista.component.html',
  styleUrls: ['./recebIndividual-lista.component.css'],
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatTableModule, MatProgressSpinnerModule, MatFormFieldModule, 
            MatInputModule, MatDatepickerModule, MatNativeDateModule, CommonModule, MatCheckboxModule, FormsModule,
            MatSelectModule, MatTooltipModule],
  })
 
export class RecebIndividualListaComponent implements OnInit {

  alunos: Aluno[] = [];
  alunoSelecionado?: Aluno;
  displayedColumns = ['data', 'titulo', 'descricao'];
  displayedHeaderColumns = ['data', 'titulo', 'descricao'];
  dataSource = new MatTableDataSource<RecebimentosService>([]);
  carregandoAlunos = false;
  carregandoAnamneses = false;
  personalid : number | null = null;

  recebimentos: Recebimento[] = [];
  recebimentosFiltrados: Recebimento[] = [];
  carregandoRecebimentos = false;
  ordemCrescente = true;

  isMobile: boolean = false;
  //currentDate: Date = dayjs.utc().tz('America/Sao_Paulo').toDate();

  anoSelecionado = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  anoSelecionadoLabel: any;
  anoFormatado: String = '';
  anos: { label: string, dataInicio: Date, dataFim: Date }[] = [];

  @ViewChild('monthPicker') monthPicker!: MatDatepicker<Date>;

  constructor(private recebimentosService: RecebimentosService, private authService: AuthService,
              private cd: ChangeDetectorRef, private bottomSheet: MatBottomSheet, 
              private http: HttpClient, private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.gerarListaAnos();
    this.isMobile = window.innerWidth <= 768; // ajustável conforme seu layout
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 768;
        this.isMobile = window.innerWidth <= 768;
    });

    this.carregarAlunos();
   
  }

  gerarListaAnos() {
    const hoje = dayjs();
    this.anos = [];

    for (let i = 0; i < 5; i++) { // últimos 5 anos
      const ano = hoje.subtract(i, 'year');
      const inicio = ano.startOf('year').toDate();
      const fim = ano.endOf('year').toDate();
      const label = ano.format('YYYY');

      const item = { label, dataInicio: inicio, dataFim: fim };
      this.anos.push(item);

      if (i === 0) this.anoSelecionadoLabel = item; // seleciona o ano atual por padrão
    }

    // Se quiser ordem crescente (do mais antigo ao mais recente):
    this.anos.reverse();
    console.log("this.anos:", this.anos);
  }

  onYearSelected(event: any) {
    const anoSelecionado = event.value; // objeto { label, dataInicio, dataFim }

    // Já vem como Date porque você criou com .toDate()
    const dataInicio: Date = anoSelecionado.dataInicio;

    // Agora sim, cria o 1º dia do mês sem perder fuso
    const dtini = new Date(
      dataInicio.getFullYear(),
      dataInicio.getMonth(),
      1
    );

    this.anoSelecionado = dtini;

    console.log("dataInicio:", dataInicio);
    console.log("dtini:", dtini);
    console.log("this.anoSelecionado:", this.anoSelecionado);

    this.carregarRecebimentos();
  }

  private carregarAlunos() {
    //const personalid = this.authService.getPersonalid();
    this.carregandoAlunos = true;
    console.log("carregar alunos:");
    this.recebimentosService.getAlunosAtivos(this.personalid!)
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
    this.carregarRecebimentos();

    this.displayedColumns = ['vencto', 'recebto', 'valor', 'formapagto', 'status'];
    this.displayedHeaderColumns = ['vencto', 'recebto', 'valor', 'forma receb', 'status'];
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


  recebimentosEditar(recebimentos: Recebimento) { 
    const isMobile = window.innerWidth < 600;
    console.log('recebimentos: ', recebimentos);
    const dialogRef = this.dialog.open(RecebimentosFormComponent, {
      data: {recebimentos},
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log("resultado", resultado);
        this.recebimentosService.salvar(resultado).subscribe(() => this.carregarRecebimentos());
      }
    });
  }

  carregarRecebimentos() {
    if (!this.alunoSelecionado) {
      this.dataSource.data = [];
      return;
    }
    const alunoid =this.alunoSelecionado.id;

    this.carregandoRecebimentos = true;
    const ano = this.anoSelecionado.getFullYear();
        
    const payload = {
      alunoid,
      ano,
    }     

    this.carregandoRecebimentos = true;
    this.recebimentosService.carregaRecebAluno(payload)
      .pipe(finalize(() => this.carregandoRecebimentos = false))
      .subscribe({
        next: (recebimentos: any) => {
          date: dayjs(recebimentos.data).toDate();
          // ordena por data
          const ord = [...recebimentos].sort((a, b) => +new Date(a.data) - +new Date(b.data));
          this.dataSource.data = ord;
        },
        error: (e: any) => {
          console.error('Erro ao carregar recebimentos', e);
          this.dataSource.data = [];
        }
      });

    /*this.recebimentosService.carregaRecebAluno(payload).subscribe(lista => {
      this.recebimentos = lista;
      //this.aplicarFiltro();
      console.log('this.recebimentosFiltrados',this.recebimentosFiltrados);
    });*/
  }

  novoRecebimento() {
    const isMobile = window.innerWidth < 600; 
    const dialogRef = this.dialog.open(RecebimentosFormComponent, {
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.recebimentosService.salvar(resultado).subscribe(() => this.carregarRecebimentos());
      }
    });
  }

  isVencido(receb: any): boolean {
    const hoje = new Date();
    const vencimento = new Date(receb.datavcto);
    return vencimento < hoje && receb.statusid == 1;
  }    

  getTooltip(receb: any): string {
    if (receb.statusid == 2) return 'Recebido';
    if (receb.statusid == 4) return 'Cancelado';
    if (receb.statusid == 3) return 'Renegociado';
    if (this.isVencido(receb)) return 'Não Recebido (Vencido)';
    return 'Não Recebido (Aguardando)';
  }  
}