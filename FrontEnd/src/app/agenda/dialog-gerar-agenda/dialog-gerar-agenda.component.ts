import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
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

  constructor(public dialogRef: MatDialogRef<DialogGerarAgendaComponent>) {}

  ngOnInit(): void {
    const hoje = dayjs();
    for (let i = -6; i <= 6; i++) {
      const data = hoje.add(i, 'month');
      const inicio = data.startOf('month').toDate();
      const fim = data.endOf('month').toDate();
      const label = data.format('MMMM [de] YYYY');
      const item = { label, dataInicio: inicio, dataFim: fim };
      this.meses.push(item);

      if (i === 0) this.mesSelecionado = item; // Seleciona o mês atual por padrão
    }
  }

  confirmar() {
    this.dialogRef.close(this.mesSelecionado);
  }
}

/*
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

import { Component, Inject, OnInit } from '@angular/core';
import dayjs from 'dayjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-dialog-gerar-agenda',
  templateUrl: './dialog-gerar-agenda.component.html',
  styleUrls: ['./dialog-gerar-agenda.component.css'],
  template: `
    <h2 mat-dialog-title>Gerar Agenda</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" style="width: 100%;">
        <mat-label>Escolha o mês</mat-label>
        <mat-select [(value)]="mesSelecionado">
          <mat-option *ngFor="let mes of meses" [value]="mes">
            {{ mes.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-button color="primary" (click)="confirmar()">Confirmar</button>
    </mat-dialog-actions>
  `,
  imports: [MatFormFieldModule, MatSelectModule, MatButtonModule, MatOptionModule, CommonModule]
})
export class DialogGerarAgendaComponent implements OnInit {
  meses: { label: string, dataInicio: Date, dataFim: Date }[] = [];
  mesSelecionado: any;

  constructor(public dialogRef: MatDialogRef<DialogGerarAgendaComponent>) {}

  ngOnInit(): void {
    const hoje = dayjs();
    for (let i = -6; i <= 6; i++) {
      const data = hoje.add(i, 'month');
      const inicio = data.startOf('month').toDate();
      const fim = data.endOf('month').toDate();
      const label = data.format('MMMM [de] YYYY');
      const item = { label, dataInicio: inicio, dataFim: fim };
      this.meses.push(item);

      if (i === 0) this.mesSelecionado = item; // mês atual
    }
  }

  confirmar() {
    this.dialogRef.close(this.mesSelecionado);
  }
}
*/