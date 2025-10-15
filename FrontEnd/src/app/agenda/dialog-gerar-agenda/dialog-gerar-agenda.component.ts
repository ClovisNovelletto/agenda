import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import dayjs from 'dayjs';
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-dialog-gerar-agenda',
  templateUrl: './dialog-gerar-agenda.component.html',
  styleUrls: ['./dialog-gerar-agenda.component.css'],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions
  ]
})
export class DialogGerarAgendaComponent implements OnInit {
  meses: { label: string, dataInicio: Date, dataFim: Date }[] = [];
  mesSelecionado: any;
  titulo: string = "Gerar Recebimentos do Mês";
  mensagem: string = "Selecione um mês para gerar os recebimentos com base nos Aluno Planos ativos cadastrados";
  
  constructor(public dialogRef: MatDialogRef<DialogGerarAgendaComponent>, @Inject(MAT_DIALOG_DATA) public  data: any ) {}

  ngOnInit(): void {
    const hoje = dayjs();
    for (let i = -6; i <= 6; i++) {
      const data = hoje.add(i, 'month');
      const inicio = data.startOf('month').toDate();
      const fim = data.endOf('month').toDate();
      const label = data.format('MM/YYYY');
      const item = { label, dataInicio: inicio, dataFim: fim };
      this.meses.push(item);

      if (i === 0) this.mesSelecionado = item; // Seleciona o mês atual por padrão
    }

    if (this.data?.titulo) {
      this.titulo = this.data.titulo;
    }
    if (this.data?.mensagem) {
      this.mensagem = this.data.mensagem;
    }
      

  }

  confirmar() {
    this.dialogRef.close(this.mesSelecionado);
  }
}

