import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDatepicker } from '@angular/material/datepicker';
import { AnamneseService, Aluno, Anamnese } from '../../services/anamnese.service';
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
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { AnamneseFormComponent } from '../anamnese-form/anamnese-form.component';

dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-anamnese-lista',
  templateUrl: './anamnese-lista.component.html',
  styleUrls: ['./anamnese-lista.component.css'],
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatTableModule, MatProgressSpinnerModule, MatFormFieldModule, 
            MatInputModule, MatDatepickerModule, MatNativeDateModule, CommonModule, MatCheckboxModule, FormsModule,
            MatSelectModule],
  })
 
export class AnamneseListaComponent implements OnInit {

  alunos: Aluno[] = [];
  alunoSelecionado?: Aluno;
  displayedColumns = ['data', 'titulo', 'descricao'];
  displayedHeaderColumns = ['data', 'titulo', 'descricao'];
  dataSource = new MatTableDataSource<Anamnese>([]);
  carregandoAlunos = false;
  carregandoAnamneses = false;
  personalid : number | null = null;
  personals: Personal[] = [];
  personal?:  Personal;

  isMobile: boolean = false;
  //currentDate: Date = dayjs.utc().tz('America/Sao_Paulo').toDate();

  @ViewChild('monthPicker') monthPicker!: MatDatepicker<Date>;

  constructor(private anamneseService: AnamneseService, private authService: AuthService,
              private cd: ChangeDetectorRef, private personalService: PersonalService, private bottomSheet: MatBottomSheet, 
              private http: HttpClient, private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 768; // ajustável conforme seu layout
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 768;
        this.isMobile = window.innerWidth <= 768;
    });
//    console.log("isMobile", this.isMobile)
//    const dataUTC = '2025-06-03T08:00:00Z';
//    const localDate = dayjs.utc(dataUTC).tz('America/Sao_Paulo');
//    dayjs.extend(utc)
//    dayjs.extend(timezone)

    this.loadPersonal().subscribe(config => {
      this.personalid = this.authService.getPersonalId();
      console.log("this.personalid: ", this.personalid)
      this.carregarAlunos();
    });
    
  }

  private carregarAlunos() {
    //const personalid = this.authService.getPersonalid();
    this.carregandoAlunos = true;
    console.log("carregar alunos:");
    this.anamneseService.getAlunosAtivos(this.personalid!)
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
    this.carregarAnamneses();
    this.displayedColumns = ['data', 'titulo', 'descricao'];
    this.displayedHeaderColumns = ['data', 'titulo', 'descricao'];
    console.log("alunoselecionado", this.alunoSelecionado);
    console.log("dataSource", this.dataSource.data);
  }

  private carregarAnamneses() {
    if (!this.alunoSelecionado) {
      this.dataSource.data = [];
      return;
    }
    const alunoid =this.alunoSelecionado.id;

    const payload = {
      alunoid
    }      

    this.carregandoAnamneses = true;
    this.anamneseService.getAnamnesesAluno(payload)
      .pipe(finalize(() => this.carregandoAnamneses = false))
      .subscribe({
        next: (anamneses: any) => {
          date: dayjs(anamneses.data).toDate();
          // ordena por data
          const ord = [...anamneses].sort((a, b) => +new Date(a.data) - +new Date(b.data));
          this.dataSource.data = ord;
        },
        error: (e: any) => {
          console.error('Erro ao carregar anamneses', e);
          this.dataSource.data = [];
        }
      });
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

  anamneseEditar(anamnese: Anamnese) {
    const isMobile = window.innerWidth < 600;
    console.log('anamnese lista->form: ', anamnese);
    const dialogRef = this.dialog.open(AnamneseFormComponent, {
      data: {anamnese},
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log("resultado", resultado);
        this.anamneseService.salvar(resultado).subscribe(() => this.carregarAnamneses());
      }
    });
  }

  anamneseNova() {
    const alunoid =this.alunoSelecionado?.id;
    const isMobile = window.innerWidth < 600;
    const dialogRef = this.dialog.open(AnamneseFormComponent, {
      width: isMobile ? '100vw' : '500px',
      height: isMobile ? '100vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : '',
      data : {alunoid: alunoid}

    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.anamneseService.salvar(resultado).subscribe(() => this.carregarAnamneses());
      }
    });
   
  }
}