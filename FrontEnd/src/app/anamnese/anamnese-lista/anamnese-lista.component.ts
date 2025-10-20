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
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
//import { registerWebPlugin } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
//import { Capacitor } from '@capacitor/core';
//import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';
import { PdfService } from '../../services/pdf.service';

//import fs from 'fs';

//import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
//import { provide } from '@angular/core';
//registerWebPlugin(Filesystem);

(pdfMake as any).vfs = pdfFonts.vfs;

//import pdfMake from 'pdfmake/build/pdfmake';
//import pdfFonts from 'pdfmake/build/vfs_fonts';

//pdfMake.vfs = pdfFonts.pdfMake.vfs;
dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-anamnese-lista',
  templateUrl: './anamnese-lista.component.html',
  styleUrls: ['./anamnese-lista.component.css'],
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatTableModule, MatProgressSpinnerModule, MatFormFieldModule, 
            MatInputModule, MatDatepickerModule, MatNativeDateModule, CommonModule, MatCheckboxModule, FormsModule,
            MatSelectModule],
  //providers: [FileOpener]
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
              private http: HttpClient, private dialog: MatDialog, private pdfService: PdfService
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
      width: isMobile ? '90vw' : 'auto',
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
      width: isMobile ? '90vw' : 'auto',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : '',
      data : {alunoid: alunoid}

    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.anamneseService.salvar(resultado).subscribe(() => this.carregarAnamneses());
      }
    });
   
  }

  async generateAnamnesePDF(row: any, event?: MouseEvent) {
    if (event) event.stopPropagation();
    //const logoBase64 = fs.readFileSync('src/assets/icons/logo.png', { encoding: 'base64' });
    //console.log('data:image/png;base64,' + logoBase64);
    const dataFormatada = dayjs(row.data).format('DD-MM-YYYY');
    const nomeLimpo = row.aluno.replace(/\s+/g, '_');
    const nomePdf = `Anamnese_${dataFormatada}_${nomeLimpo}.pdf`;

    //const logoBase64 = 'icons/logo.png'; // coloque aqui o base64 do logo H2U
    const logoBase64 = await this.pdfService.getLogoBase64();

    const docDef = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content: [
        // Logo + Título

        {
          columns: [
            { image: logoBase64, width: 30 },          // coluna do logo
            { text: 'Relatório de Anamnese', style: 'header', alignment: 'center' } // coluna do título
          ],
          columnGap: 0,   // espaço entre as colunas
          widths: ['auto', '*'],  // 'auto' para o logo, '*' ocupa o resto do espaço para o título
          margin: [0, 0, 0, 20] // margem inferior do bloco
        },

        // Divisor
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, color: '#e0e0e0' }] },
        { text: ' ', margin: [0, 0] },

        // Informações principais em duas colunas

        {
          columns: [
            [
              {
                text: [
                  { text: 'Profissional: ', color: '#0070C0', bold: true }, // label colorido
                  { text: row.personal } // valor normal
                ],
                style: 'info'
              },
              {
                text: [
                  { text: 'Aluno/Paciente: ', color: '#0070C0', bold: true },
                  { text: row.aluno }
                ],
                style: 'info'
              },
              {
                text: [
                  { text: 'Data: ', color: '#0070C0', bold: true },
                  { text: dataFormatada }
                ],
                style: 'info'
              },
            ],
            [
              {
                text: [
                  { text: 'Peso: ', color: '#0070C0', bold: true },
                  { text: `${row.peso} kg` }
                ],
                style: 'info',
                alignment: 'right'
              },
              {
                text: [
                  { text: 'Altura: ', color: '#0070C0', bold: true },
                  { text: `${row.altura} m` }
                ],
                style: 'info',
                alignment: 'right'
              },
              {
                text: [
                  { text: 'Idade: ', color: '#0070C0', bold: true },
                  { text: `${row.idade} anos` }
                ],
                style: 'info',
                alignment: 'right'
              },
            ],
          ],
          columnGap: 10,
          widths: ['*', 'auto'],
          margin: [0, 0, 0, 0],
        },

        // Divisor
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, color: '#e0e0e0' }] },
        { text: ' ', margin: [0, 0] },

        // Seções detalhadas com cores vibrantes
        { text: 'Objetivo', style: 'sectionHeader' },
        { text: row.objetivo || '-', style: 'sectionText' },

        { text: 'Principal Reclamação', style: 'sectionHeader' },
        { text: row.principalrecl || '-', style: 'sectionText' },

        { text: 'Hábitos Alimentares', style: 'sectionHeader' },
        { text: row.alimentacao || '-', style: 'sectionText' },

        { text: 'Medicamentos', style: 'sectionHeader' },
        { text: row.medicamentos || '-', style: 'sectionText' },

        { text: 'Histórico de Saúde', style: 'sectionHeader' },
        { text: row.historicosaude || '-', style: 'sectionText' },

        { text: 'Fatores de Risco', style: 'sectionHeader' },
        { text: row.fatoresrisco || '-', style: 'sectionText' },

        { text: 'Sono', style: 'sectionHeader' },
        { text: row.sono || '-', style: 'sectionText' },

        { text: 'Descrição Geral', style: 'sectionHeader' },
        { text: row.descricao || '-', style: 'sectionText' },
      ],

      styles: {
        header: { fontSize: 20, bold: true, color: '#1b5e20' },        // verde escuro H2U
        info: { fontSize: 11, margin: [0, 2] },
        sectionHeader: { fontSize: 13, bold: true, color: '#ff6f00', margin: [0, 10, 0, 4] }, // laranja vibrante
        sectionText: { fontSize: 11, margin: [0, 0, 0, 10], alignment: 'justify' },
      },

      defaultStyle: {
        font: 'Roboto',
      },
    };

    this.pdfService.gerarESalvarPDF(nomePdf, docDef);
  }

  async generateAnamnesePDFPadrao(row: any, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const dataFormatada = dayjs(row.data).format('DD-MM-YYYY');
    const nomeLimpo = row.aluno.replace(/\s+/g, '_');
    const nomePdf = `Anamnese_${dataFormatada}_${nomeLimpo}.pdf`;

    const docDef = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Cabeçalho
        {
          text: 'Relatório de Anamnese',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },

        // Bloco com informações principais
        {
          columns: [
            [
              { text: `Profissional: ${row.personal}`, style: 'info' },
              { text: `Aluno/Paciente: ${row.aluno}`, style: 'info' },
              { text: `Data: ${dataFormatada}`, style: 'info' },
            ],
            [
              { text: `Peso: ${row.peso} kg`, style: 'info' },
              { text: `Altura: ${row.altura} m`, style: 'info' },
              { text: `Idade: ${row.idade} anos`, style: 'info' },
            ],
          ],
          columnGap: 20,
          margin: [0, 0, 0, 15],
        },

        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, color: '#cccccc' }] },
        { text: ' ', margin: [0, 10] },

        // Seções de texto
        { text: 'Objetivo', style: 'sectionHeader' },
        { text: row.objetivo || '-', style: 'sectionText' },

        { text: 'Principal Reclamação', style: 'sectionHeader' },
        { text: row.pricipalrecl || '-', style: 'sectionText' },

        { text: 'Hábitos Alimentares', style: 'sectionHeader' },
        { text: row.alimentacao || '-', style: 'sectionText' },

        { text: 'Medicamentos', style: 'sectionHeader' },
        { text: row.medicamentos || '-', style: 'sectionText' },

        { text: 'Histórico de Saúde', style: 'sectionHeader' },
        { text: row.historicosaude || '-', style: 'sectionText' },

        { text: 'Fatores de Risco', style: 'sectionHeader' },
        { text: row.fatoresrisco || '-', style: 'sectionText' },

        { text: 'Sono', style: 'sectionHeader' },
        { text: row.sono || '-', style: 'sectionText' },

        { text: 'Descrição Geral', style: 'sectionHeader' },
        { text: row.descricao || '-', style: 'sectionText' },
      ],

      styles: {
        header: { fontSize: 20, bold: true, color: '#1b5e20' },
        info: { fontSize: 11, margin: [0, 2] },
        sectionHeader: { fontSize: 13, bold: true, color: '#2e7d32', margin: [0, 10, 0, 4] },
        sectionText: { fontSize: 11, margin: [0, 0, 0, 10], alignment: 'justify' },
      },
    };
    this.pdfService.gerarESalvarPDF(nomePdf, docDef);
  }
/*
  async generateAnamnesePDFxxx(row: any, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const dataFormatada = dayjs(row.data).format('DD-MM-YYYY');
    const nomePdf = `Anamnese_${dataFormatada}_${row.aluno}.pdf`;

    const docDef = {
      content: [
        { text: 'Relatório de Anamnese', style: 'header' },
        { text: `Título: ${row.titulo}` },
        { text: `Aluno: ${row.aluno}` },
        { text: `Data: ${dataFormatada}` },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      }
    };

    const pdfDoc = (pdfMake as any).createPdf(docDef);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      pdfDoc.getBase64(async (data: string) => {
        try {
          // ⚠️ Importante: não use Encoding.UTF8
          await Filesystem.writeFile({
            path: nomePdf,
            data, // base64 puro
            directory: Directory.Documents
          });

          alert(`✅ PDF salvo em Documentos como ${nomePdf}`);

          const fileUri = await Filesystem.getUri({
            path: nomePdf,
            directory: Directory.Documents
          });

          // 🔗 Se quiser apenas abrir:
          await Browser.open({ url: fileUri.uri });

          // 🔗 Se quiser compartilhar:
          await Share.share({
            title: 'Anamnese',
            text: 'Segue o PDF gerado pelo app.',
            url: fileUri.uri,
            dialogTitle: 'Compartilhar PDF'
          });
        } catch (err) {
          console.error('Erro ao salvar ou abrir PDF', err);
          alert('❌ Falha ao salvar ou abrir o PDF.');
        }
      });
    } else {
      // 💻 Computador: download direto
      pdfDoc.getBlob((blob: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nomePdf;
        link.click();
      });
    }
  }

  async generateAnamnesePDFmaisuma(row: any, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const dataFormatada = dayjs(row.data).format('DD-MM-YYYY');
    const nomePdf = `Anamnese_${dataFormatada}_${row.aluno}.pdf`;

    const docDef = {
      content: [
        { text: 'Relatório de Anamnese', style: 'header' },
        { text: `Título: ${row.titulo}` },
        { text: `Aluno: ${row.aluno}` },
        { text: `Data: ${dataFormatada}` },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      }
    };

    const pdfDoc = (pdfMake as any).createPdf(docDef);
    const platform = Capacitor.getPlatform();

    if (platform === 'android' || platform === 'ios') {
      pdfDoc.getBase64(async (data: string) => {
        try {
          // tenta salvar internamente (funciona em Android 15)
          await Filesystem.writeFile({
            path: nomePdf,
            data,
            directory: Directory.Data
          });
          alert(`PDF salvo internamente (${nomePdf})`);

          const uriResult = await Filesystem.getUri({
            path: nomePdf,
            directory: Directory.Data
          });

          await Browser.open({ url: uriResult.uri });

        } catch (err) {
          alert(`Falha ao salvar internamente, tentando download...erro: ${err}`);

          // fallback → faz download igual no navegador
          try {
            pdfDoc.getBlob((blob: Blob) => {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = nomePdf;
              link.click();
              alert(`PDF salvo em download (${nomePdf})`);
            });
            const uriResult = await Filesystem.getUri({
              path: nomePdf,
              directory: Directory.Data
            });

            await Browser.open({ url: uriResult.uri });
          } catch (err) {
            alert(`Falha ao salvar em download...erro: ${err}`);
          }
        }
      });
    } else {
      // navegador
      pdfDoc.getBlob((blob: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nomePdf;
        link.click();
      });
    }
  }


  generateAnamnesePDFoutra(row: any, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const dataFormatada = dayjs(row.data).format('DD-MM-YYYY');
    const nomePdf = `Anamnese_${dataFormatada}_${row.aluno}.pdf`;

    const docDef = {
      content: [
        { text: 'Relatório de Anamnese', style: 'header' },
        { text: `Título: ${row.titulo}` },
        { text: `Aluno: ${row.aluno}` },
        { text: `Data: ${dataFormatada}` },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      }
    };

    const pdfDoc = (pdfMake as any).createPdf(docDef);
    const platform = Capacitor.getPlatform();

    if (platform === 'android' || platform === 'ios') {
      pdfDoc.getBase64(async (data: string) => {
        try {
          await Filesystem.requestPermissions();
          await Filesystem.writeFile({
            path: nomePdf,
            data,
            directory: Directory.Data // ou Directory.ExternalStorage
          });
          alert(`PDF salvo com sucesso em ${nomePdf}`);
        } catch (err) {
          console.error('Erro ao salvar PDF:', err);
          alert('Falha ao salvar o PDF.');
        }
      });
    } else {
      pdfDoc.getBlob((blob: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nomePdf;
        link.click();
      });
    }
  }

  generateAnamnesePDFanterior(row: any, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const dataFormatada = dayjs(row.data).format('DD-MM-YYYY');
    const nomePdf = `Anamnese_${dataFormatada}_${row.aluno}.pdf`;

    const docDef = {
      content: [
        { text: 'Relatório de Anamnese', style: 'header' },
        { text: `Título: ${row.titulo}` },
        { text: `Aluno: ${row.aluno}` },
        { text: `Data: ${dataFormatada}` },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      }
    };

    const pdfDoc = (pdfMake as any).createPdf(docDef);

    // Detecta se é mobile
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      pdfDoc.getBase64(async (data: string) => {
        await Filesystem.writeFile({
          path: nomePdf,
          data: data,
          directory: Directory.External,
          encoding: Encoding.UTF8
        })
      });
    } else  {
      pdfDoc.getBlob((blob: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nomePdf;
        link.click();
      });
    }
    //const files = await Filesystem.readdir({ directory: Directory.External });
    //console.log('Arquivos:', files.files);
  }

  generateAnamnesePDFold(row: any, event?: MouseEvent) {
    if (event) event.stopPropagation();

    const dataFormatada = dayjs(row.data).format('DD-MM-YYYY');
    const nomePdf = `Anamnese_${dataFormatada}_${row.aluno}.pdf`;

    const docAnamnese: TDocumentDefinitions = {
      content: [
        { text: 'Relatório de Anamnese', style: 'header' },
        { text: `Título: ${row.titulo}` },
        { text: `Aluno: ${row.aluno}` },
        { text: `Data: ${dataFormatada}` }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] }
      }
    };

    const pdfDocGenerator = (pdfMake as any).createPdf(docAnamnese);

    // Detecta se é mobile
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // Para mobile, força o download com blob
      pdfDocGenerator.getBlob((blob: Blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = nomePdf;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      });
    } else {
      // Para desktop: abre nova aba com nome automático
      pdfDocGenerator.download(nomePdf);
    }
  }
*/

}