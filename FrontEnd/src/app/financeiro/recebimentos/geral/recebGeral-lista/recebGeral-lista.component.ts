import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RecebimentosFormComponent } from '../../recebimentos-form/recebimentos-form.component';
import { RecebimentosService } from '../../../../services/recebimentos.service';
import { Recebimento } from '../../../../models/recebimento.model';
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

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

@Component({
  selector: 'app-recebGeral-lista',
  standalone: true,
   imports: [CommonModule, MatIconModule, MatNativeDateModule, MatSlideToggleModule, MatButtonToggleModule, FormsModule, MatFormFieldModule, 
            MatInputModule, MatButtonModule, MatSelectModule, MatMenuModule, MatTooltipModule /*,IonicModule*/] , // Adicione o RouterModule aqui]
  templateUrl: './recebGeral-lista.component.html',
  styleUrls: ['./recebGeral-lista.component.css'], 
})
export class RecebGeralListaComponent implements OnInit {
  filtroTexto: string = "";
  filtroStatus: string = "Todos";
  recebimentos: Recebimento[] = [];
  recebimentosFiltrados: Recebimento[] = [];
  ordemCrescente = true;

  // mês selecionado: sempre o primeiro dia do mês
  mesSelecionado = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  mesSelecionadoLabel: any;
  mesFormatado: String = '';
  meses: { label: string, dataInicio: Date, dataFim: Date }[] = [];
  carregandoRecebimentos = false;
  isMobile = window.innerWidth < 768;

  constructor(private dialog: MatDialog, private recebimentosService: RecebimentosService) {}

  ngOnInit(): void {
    const dataUTC = '2025-06-03T08:00:00Z';
    //const localDate = dayjs.utc(dataUTC).tz('America/Sao_Paulo');
    dayjs.extend(utc)
    dayjs.extend(timezone)
    this.atualizarMesFormatado();
    this.gerarListaMeses();
    this.carregarRecebimentos();
  }

  onEditar(recebimentos: Recebimento) { 
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
    this.carregandoRecebimentos = true;
    const ano = this.mesSelecionado.getFullYear();
    const mes1a12 = this.mesSelecionado.getMonth() + 1;

    const payload = {
      ano,
      mes1a12
    }     

/*
    this.agendaService.getAulasDoAlunoMes(payload)
      .pipe(finalize(() => this.carregandoRecebimentos = false))
      .subscribe({
        next: (aulas: any) => {
    */

    this.recebimentosService.listar(payload).subscribe(lista => {
      this.recebimentos = lista;
      this.aplicarFiltro();
      console.log('this.recebimentosFiltrados',this.recebimentosFiltrados);
    });
  }

  aplicarFiltro(): void {
  this.recebimentosFiltrados = this.recebimentos
    .filter(recebimento => {

//      const correspondeTexto = this.filtroTexto
//        ? recebimento.aluno.toLowerCase().includes(this.filtroTexto.toLowerCase())
//        : true;

      const correspondeStatus = this.filtroStatus === 'Todos'
        || (this.filtroStatus === 'Não Recebidos' && recebimento.statusid == 1)
        || (this.filtroStatus === 'Recebidos' && recebimento.statusid === 2)
        || (this.filtroStatus === 'Renegociados' && recebimento.statusid === 3)
        || (this.filtroStatus === 'Cancelados' && recebimento.statusid === 4);

      return correspondeStatus;
    })
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

    this.carregarRecebimentos();
  }

  atualizarMesFormatado() {
    const mes = this.mesSelecionado.getMonth() + 1;
    const ano = this.mesSelecionado.getFullYear();
    this.mesFormatado = `${mes.toString().padStart(2, '0')}/${ano}`;
    console.log("this.mesFormatado", this.mesFormatado);
  }

  gerarListaMeses() {
    const hoje = dayjs();
    for (let i = -12; i <= 1; i++) {
      const data = hoje.add(i, 'month');
      const inicio = data.startOf('month').toDate();
      const fim = data.endOf('month').toDate();
      const label = data.format('MM/YYYY');
      const item = { label, dataInicio: inicio, dataFim: fim };
      this.meses.push(item);

      if (i === 0) this.mesSelecionadoLabel = item; // Seleciona o mês atual por padrão
    }
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
