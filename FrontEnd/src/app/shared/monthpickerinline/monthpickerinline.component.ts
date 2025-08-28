import { Component } from '@angular/core';
import { MatDatepickerModule, MatCalendar } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-month-picker-inline',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatCalendar,
    DatePipe   // 👈 adiciona o DatePipe aqui
  ],
  template: `
    <mat-calendar
      [(selected)]="mesSelecionado"
      [startAt]="mesSelecionado"
      [startView]="'multi-year'"
      (monthSelected)="onMonthSelected($event)"
    ></mat-calendar>

    <div style="margin-top: 10px; font-weight: bold">
      Selecionado: {{ mesSelecionado | date:'MM/yyyy' }}
    </div>
  `,
})
export class MonthPickerInlineComponent {
  mesSelecionado = new Date();

  onMonthSelected(normalizedMonth: Date) {
    this.mesSelecionado = new Date(
      normalizedMonth.getFullYear(),
      normalizedMonth.getMonth(),
      1
    );
  }
}
