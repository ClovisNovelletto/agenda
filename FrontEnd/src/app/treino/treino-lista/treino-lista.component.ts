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
import { TreinoItemFormComponent } from '../treinoItem-form/treinoItem-form.component';
import { TreinoFormComponent } from '../treino-form/treino-form.component';
import { TreinoItem } from '../../models/treinoItem.model';
import { MatTooltipModule } from '@angular/material/tooltip'; // <-- Importe aqui
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-treino-lista',
  templateUrl: './treino-lista.component.html',
  styleUrls: ['./treino-lista.component.css'],
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatTableModule, MatProgressSpinnerModule, MatFormFieldModule, 
            MatInputModule, MatDatepickerModule, MatNativeDateModule, CommonModule, MatCheckboxModule, FormsModule,
            MatSelectModule, MatTooltipModule, DragDropModule],
  })
 
export class TreinoListaComponent implements OnInit {

  filtroStatus: string = "Todos";
  filtroTexto: string = "";
  treinos: Treino[] = [];
  treinosFiltrados: Treino[] = [];
  treinoSelecionado: any;
  displayedColumns = ['exercicio', 'serie', 'tempo', 'peso'];
  displayedHeaderColumns = ['exercicio', 'serie', 'tempo', 'peso'];
  dataSource = new MatTableDataSource<TreinoItem>([]);
  carregandoTreinos = false;
  carregandoTreinosItems = false;
  personalid : number | null = null;

  treinosItem: TreinoItem[] = [];
  
  ordemCrescente = true;

  isMobile: boolean = false;
  //currentDate: Date = dayjs.utc().tz('America/Sao_Paulo').toDate();

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

    this.carregarTreinos();
   
  }

private carregarTreinos() {
  this.carregandoTreinos = true;
  console.log("carregar treinos:");

  this.treinoService.carregaTreinos()
      .pipe(finalize(() => this.carregandoTreinos = false))
    .subscribe({
      next: (resp: any) => {
        const selecionadoId = this.treinoSelecionado?.id;
        this.treinos = [...resp]; // 👈 força nova referência

        this.treinoSelecionado = this.treinos.find(t => t.id === selecionadoId)
          || this.treinos[0];
        if (this.treinos.length && !this.treinoSelecionado) {
          this.selecionarTreino(this.treinos[0]);
        }
        this.aplicarFiltro(); // 👈 agora sim no lugar certo
        console.log("this.treinos:", this.treinos);
        console.log("this.treinoSelecionado:", this.treinoSelecionado);
      },
      error: (e: any) => console.error('Erro ao carregar treinos', e)
    });
}

  private carregarTreinos_OLD() {
    //const personalid = this.authService.getPersonalid();
    this.carregandoTreinos = true;
    console.log("carregar treinositems:");
    this.treinoService.carregaTreinos()
      .pipe(finalize(() => this.carregandoTreinos = false))
      .subscribe({
        next: (resp: any) => {
          this.treinos = resp;
          if (this.treinos.length && !this.treinoSelecionado) {
            this.selecionarTreino(this.treinos[0]);
          }
        },
        error: (e: any) => console.error('Erro ao carregar treinos', e)
      });
      this.aplicarFiltro()
      console.log("this.treinos:",this.treinos);
  }

  selecionarTreino(treino: Treino) {
    console.log("selecionarTreino", treino);
    if (!treino || this.treinoSelecionado?.id === treino.id) return;
    this.treinoSelecionado = treino;
    this.aplicarFiltro();

    this.displayedColumns = ['exercicio', 'serie', 'tempo', 'peso'];
    this.displayedHeaderColumns = ['exercicio', 'serie', 'tempo', 'peso'];
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

  trackByTreinoId(index: number, treino: any): number {
    return treino.id;
  }

  formatMonthYear = (date: Date | null): string => {
    return date ? `${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}` : '';
  };


  treinoItemEditar(treinoItems: TreinoItem) { 
    const isMobile = window.innerWidth < 600;
    console.log('treinoItems: ', treinoItems);
    const dialogRef = this.dialog.open(TreinoItemFormComponent, {
      data: {treinoItems},
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log("resultado", resultado);
        this.treinoService.salvarItem(resultado).subscribe(() => this.carregarTreinosItems());
      }
    });
  }

  carregarTreinosItems() {
    console.log("entrou treinos items");
    if (!this.treinoSelecionado) {
      this.dataSource.data = [];
      return;
    }
    const treinoid =this.treinoSelecionado.id;

    this.carregandoTreinosItems = true;
        
    const payload = {treinoid}     

    console.log("treinoid", treinoid);
    this.carregandoTreinosItems = true;
    this.treinoService.carregaTreinosItens(payload)
      .pipe(finalize(() => this.carregandoTreinosItems = false))
      .subscribe({
        next: (treinosItems: any) => {
          // ordena por ordem
          const ord = [...treinosItems].sort(
            (a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0)
          );
          this.dataSource.data = ord;
        },
        error: (e: any) => {
          console.error('Erro ao carregar treinos itens', e);
          this.dataSource.data = [];
        }
      });
      console.log("treinosItem", this.treinosItem);
  }

  treinoItemNovo() {
    const treinoid =this.treinoSelecionado?.id;
    const isMobile = window.innerWidth < 600; 
    const dialogRef = this.dialog.open(TreinoItemFormComponent, {
      data: {treinoid},
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.treinoService.salvarItem(resultado).subscribe(() => this.carregarTreinosItems());
      }
    });
  }

  treinoNovo() {
    const isMobile = window.innerWidth < 600; 
    const dialogRef = this.dialog.open(TreinoFormComponent, {
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.treinoService.salvarTreino(resultado).subscribe(() => this.carregarTreinos());
      }
    });
  }

  treinoEditar(treino: Treino) { 
    const isMobile = window.innerWidth < 600;
    console.log('treinos: ', treino);
    const dialogRef = this.dialog.open(TreinoFormComponent, {
      data: {treino},
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log("resultado", resultado);
        this.treinoService.salvarTreino(resultado).subscribe(() => this.carregarTreinos());
      }
    });
  }

aplicarFiltro(): void {
    console.log('Entro no filtro');
  this.treinosFiltrados = this.treinos
    .filter(treino => {
      const correspondeTexto = this.filtroTexto
        ? treino.descricao.toLowerCase().includes(this.filtroTexto.toLowerCase())
        : true;

      const correspondeStatus = this.filtroStatus === 'Todos'
        || (this.filtroStatus === 'Ativos' && treino.ativo)
        || (this.filtroStatus === 'Inativos' && !treino.ativo);
console.log( correspondeTexto);
console.log( correspondeStatus);
      return correspondeTexto && correspondeStatus;
    })
    .sort((a, b) => a.descricao.localeCompare(b.descricao)); // <-- ordenação fixa por nome
    // 🔥 valida seleção
    if (!this.treinosFiltrados.find(t => t.id === this.treinoSelecionado?.id)) {
      this.treinoSelecionado = this.treinosFiltrados[0] || null;
    }    
    console.log("carregar itens");
    this.carregarTreinosItems();
  }

  salvarOrdemExercicios(lista: any[]) {
    console.log("lista: " + lista);
    this.treinoService.atualizarOrdemTreinoItem(lista).subscribe({
      next: () => console.log('Ordem salva'),
      error: err => console.error(err)
    });
    //return this.http.put('/api/treino-itens/ordem', lista);
  }

  drop(event: CdkDragDrop<TreinoItem[]>) {
    console.log("TreinoItem: " + event);

    //dataSource = new MatTableDataSource<TreinoItem>();
    const data = this.dataSource.data as TreinoItem[];
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

    this.salvarOrdemExercicios(data);
  }  
  

}