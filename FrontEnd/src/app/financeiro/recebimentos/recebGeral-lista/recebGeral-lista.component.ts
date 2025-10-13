import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RecebGeralFormComponent } from '../recebGeral-form/recebGeral-form.component';
import { RecebGeralService } from '../../../services/recebGeral.service';
import { RecebGeral } from '../../../models/recebGeral.model';
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

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

@Component({
  selector: 'app-recebGeral-lista',
  standalone: true,
   imports: [CommonModule, MatIconModule, MatNativeDateModule, MatSlideToggleModule, MatButtonToggleModule, FormsModule, MatFormFieldModule, 
            MatInputModule, MatButtonModule, MatSelectModule, MatMenuModule /*,IonicModule*/] , // Adicione o RouterModule aqui]
  templateUrl: './recebGeral-lista.component.html',
  styleUrls: ['./recebGeral-lista.component.css'], 
})
export class RecebGeralListaComponent implements OnInit {
  filtroTexto: string = "";
  filtroStatus: string = "Todos";
  recebGerals: RecebGeral[] = [];
  recebGeralsFiltrados: RecebGeral[] = [];
  ordemCrescente = true;

  // mês selecionado: sempre o primeiro dia do mês
  mesSelecionado = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  mesSelecionadoLabel: any;
  mesFormatado: String = '';
  meses: { label: string, dataInicio: Date, dataFim: Date }[] = [];
  carregandoRecebGeral = false;
  constructor(private dialog: MatDialog, private recebGeralService: RecebGeralService) {}

  ngOnInit(): void {
    const dataUTC = '2025-06-03T08:00:00Z';
    //const localDate = dayjs.utc(dataUTC).tz('America/Sao_Paulo');
    dayjs.extend(utc)
    dayjs.extend(timezone)
    this.atualizarMesFormatado();
    this.gerarListaMeses();
    this.carregarRecebGeral();
  }

  onEditar(recebGeral: RecebGeral) { 
    const isMobile = window.innerWidth < 600;
    console.log('recebGeral: ', recebGeral);
    const dialogRef = this.dialog.open(RecebGeralFormComponent, {
      data: {recebGeral},
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log("resultado", resultado);
        this.recebGeralService.salvar(resultado).subscribe(() => this.carregarRecebGeral());
      }
    });
  }

  carregarRecebGeral() {
    this.carregandoRecebGeral = true;
    const ano = this.mesSelecionado.getFullYear();
    const mes1a12 = this.mesSelecionado.getMonth() + 1;

    const payload = {
      ano,
      mes1a12
    }     

/*
    this.agendaService.getAulasDoAlunoMes(payload)
      .pipe(finalize(() => this.carregandoRecebGeral = false))
      .subscribe({
        next: (aulas: any) => {
    */

    this.recebGeralService.listar(payload).subscribe(lista => {
      this.recebGerals = lista;
      this.aplicarFiltro();
      console.log('this.recebGeralsFiltrados',this.recebGeralsFiltrados);
    });
  }

  aplicarFiltro(): void {
  this.recebGeralsFiltrados = this.recebGerals
    .filter(recebGeral => {

//      const correspondeTexto = this.filtroTexto
//        ? recebGeral.aluno.toLowerCase().includes(this.filtroTexto.toLowerCase())
//        : true;

      const correspondeStatus = this.filtroStatus === 'Todos'
        || (this.filtroStatus === 'Não Recebidos' && recebGeral.status === 'Não Recebido')
        || (this.filtroStatus === 'Recebidos' && recebGeral.status === 'Recebido')
        || (this.filtroStatus === 'Cancelados' && recebGeral.status === 'Cancelado')
        || (this.filtroStatus === 'Renegociados' && recebGeral.status === 'Renegociado');

      return correspondeStatus;
    })
  }


  novoRecebGeral() {
    const isMobile = window.innerWidth < 600; 
    const dialogRef = this.dialog.open(RecebGeralFormComponent, {
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.recebGeralService.salvar(resultado).subscribe(() => this.carregarRecebGeral());
      }
    });
  }



  ordenarPor(campo: keyof RecebGeral) {
    this.recebGerals.sort((a, b) => {
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
  
      this.carregarRecebGeral();
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
}
