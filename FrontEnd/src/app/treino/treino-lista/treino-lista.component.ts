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
import { TreinoService } from '../../services/treino.service';
import type { Treino } from '../../models/treino.model';
import { TreinoFormComponent } from '../treino-form/treino-form.component';
import { TreinoItem } from '../../models/treinoItem.model';
import { MatTooltipModule } from '@angular/material/tooltip'; // <-- Importe aqui


dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-treino-lista',
  templateUrl: './treino-lista.component.html',
  styleUrls: ['./treino-lista.component.css'],
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatTableModule, MatProgressSpinnerModule, MatFormFieldModule, 
            MatInputModule, MatDatepickerModule, MatNativeDateModule, CommonModule, MatCheckboxModule, FormsModule,
            MatSelectModule, MatTooltipModule],
  })
 
export class treinoListaComponent implements OnInit {

  treino: Treino[] = [];
  treinoSelecionado?: Treino;
  displayedColumns = ['data', 'titulo', 'descricao'];
  displayedHeaderColumns = ['data', 'titulo', 'descricao'];
  dataSource = new MatTableDataSource<TreinoService>([]);
  carregandoTreinos = false;
  carregandoTreinosItems = false;
  personalid : number | null = null;

  treinosItem: TreinoItem[] = [];
  treinosItemsFiltrados: TreinoItem[] = [];
  carregandoItens = false;
  ordemCrescente = true;

  isMobile: boolean = false;
  //currentDate: Date = dayjs.utc().tz('America/Sao_Paulo').toDate();

  anoSelecionado = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  anoSelecionadoLabel: any;
  anoFormatado: String = '';
  anos: { label: string, dataInicio: Date, dataFim: Date }[] = [];

  @ViewChild('monthPicker') monthPicker!: MatDatepicker<Date>;

  constructor(private treinoService: TreinoService, private authService: AuthService,
              private cd: ChangeDetectorRef, private bottomSheet: MatBottomSheet, 
              private http: HttpClient, private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 768; // ajustável conforme seu layout
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 768;
        this.isMobile = window.innerWidth <= 768;
    });

    this.carregarTreinosItems();
   
  }


  private carregarTreinos() {
    //const personalid = this.authService.getPersonalid();
    this.carregandoTreinos = true;
    console.log("carregar treinositems:");
    this.treinoService.carregaTreinos()
      .pipe(finalize(() => this.carregandoTreinosItems = false))
      .subscribe({
        next: (resp: any) => {
          this.treino = resp;
          if (this.treino.length && !this.treinoSelecionado) {
            this.selecionarTreino(this.treino[0]);
          }
        },
        error: (e: any) => console.error('Erro ao carregar alunos', e)
      });
      console.log("this.alunos:",this.treino);
  }

  selecionarTreino(treino: Treino) {
    if (!treino || this.treinoSelecionado?.id === treino.id) return;
    this.treinoSelecionado = treino;
    this.carregarTreinosItems();

    this.displayedColumns = ['vencto', 'recebto', 'valor', 'formapagto', 'status'];
    this.displayedHeaderColumns = ['vencto', 'recebto', 'valor', 'forma receb', 'status'];
    console.log("treinoselecionado", this.treinoSelecionado);
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


  treinoItemEditar(treinoItems: TreinoItem) { 
    const isMobile = window.innerWidth < 600;
    console.log('treinoItemss: ', treinoItems);
    const dialogRef = this.dialog.open(TreinoFormComponent, {
      data: {treinoItems},
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log("resultado", resultado);
        this.treinoService.salvar(resultado).subscribe(() => this.carregarTreinosItems());
      }
    });
  }

  carregarTreinosItems() {
    if (!this.treinoSelecionado) {
      this.dataSource.data = [];
      return;
    }
    const treinoid =this.treinoSelecionado.id;

    this.carregandoTreinosItems = true;
        
    const payload = {
      treinoid,
    }     

    this.carregandoTreinosItems = true;
    this.treinoService.carregaTreinosItens(payload)
      .pipe(finalize(() => this.carregandoTreinosItems = false))
      .subscribe({
        next: (treinosItems: any) => {
          date: dayjs(treinosItems.data).toDate();
          // ordena por data
          const ord = [...treinosItems].sort((a, b) => +new Date(a.data) - +new Date(b.data));
          this.dataSource.data = ord;
        },
        error: (e: any) => {
          console.error('Erro ao carregar recebimentos', e);
          this.dataSource.data = [];
        }
      });

  }

  novoTreinosItem() {
    const isMobile = window.innerWidth < 600; 
    const dialogRef = this.dialog.open(TreinoFormComponent, {
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.treinoService.salvar(resultado).subscribe(() => this.carregarTreinosItems());
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