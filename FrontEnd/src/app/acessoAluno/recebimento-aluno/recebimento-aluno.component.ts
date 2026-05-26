import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RecebimentosService } from '../../services/recebimentos.service';
import { Recebimento } from '../../models/recebimento.model';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { NgModule } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip'; // <-- Importe aqui
import { AuthService } from '../../auth.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-recebimento-aluno',
  standalone: true,
   imports: [CommonModule, MatIconModule, MatNativeDateModule, MatSlideToggleModule, MatButtonToggleModule, FormsModule, MatFormFieldModule, 
            MatInputModule, MatButtonModule, MatSelectModule, MatMenuModule, MatTooltipModule] , 
  templateUrl: './recebimento-aluno.component.html',
  styleUrls: ['./recebimento-aluno.component.css'], 
})
export class RecebimentoAlunoComponent implements OnInit {
  filtroTexto: string = "";
  filtroStatus: string = "Todos";
  recebimentos: Recebimento[] = [];
  recebimentosFiltrados: Recebimento[] = [];
  ordemCrescente = true;

  // mês selecionado: sempre o primeiro dia do mês
  anoSelecionado = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  anoSelecionadoLabel: any;
  anoFormatado: String = '';
  anos: { label: string, dataInicio: Date, dataFim: Date }[] = [];
  carregandoRecebimentos = false;
  isMobile = window.innerWidth < 768;
  alunoid: any=0;
  constructor(private dialog: MatDialog, private recebimentosService: RecebimentosService, private authService: AuthService) {}

  ngOnInit(): void {
    this.alunoid = this.authService.getAlunoId();
    const dataUTC = '2025-06-03T08:00:00Z';
    //const localDate = dayjs.utc(dataUTC).tz('America/Sao_Paulo');
    dayjs.extend(utc)
    dayjs.extend(timezone)
    this.gerarListaAnos();
    this.carregarRecebimentos();
  }

  carregarRecebimentos() {
    this.carregandoRecebimentos = true;

    const alunoid =this.alunoid;
    const ano = this.anoSelecionado.getFullYear();

    const payload = {
      alunoid,
      ano,
    }     

    this.recebimentosService.carregaRecebAluno(payload)
      .pipe(finalize(() => this.carregandoRecebimentos = false))
      .subscribe({
        next: (recebimentos: any) => {
          date: dayjs(recebimentos.data).toDate();
          // ordena por data
          const ord = [...recebimentos].sort((a, b) => +new Date(a.data) - +new Date(b.data));
          this.recebimentos = ord;
          this.aplicarFiltro();
        },
        error: (e: any) => {
          console.error('Erro ao carregar recebimentos', e);
          this.recebimentos = [];
        }
      });
      
      console.log('this.recebimentosFiltrados',this.recebimentosFiltrados);
  }

  aplicarFiltro(): void {
  this.recebimentosFiltrados = this.recebimentos
    .filter(recebimento => {


      const correspondeStatus = this.filtroStatus === 'Todos'
        || (this.filtroStatus === 'Não Recebidos' && recebimento.statusid == 1)
        || (this.filtroStatus === 'Recebidos' && recebimento.statusid === 2)
        || (this.filtroStatus === 'Renegociados' && recebimento.statusid === 3)
        || (this.filtroStatus === 'Cancelados' && recebimento.statusid === 4);

      return correspondeStatus;
    })
  }

  ordenarPor(campo: keyof Recebimento) {
    this.recebimentos.sort((a, b) => {
      const valorA = a[campo]?.toString().toLowerCase() || '';
      const valorB = b[campo]?.toString().toLowerCase() || '';
      return this.ordemCrescente ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
    });

    this.ordemCrescente = !this.ordemCrescente;
  }

  
  formatMonthYear = (date: Date | null): string => {
    return date ? `${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}` : '';
  };


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
