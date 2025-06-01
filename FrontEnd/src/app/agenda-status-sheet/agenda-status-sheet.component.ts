// agenda-status-sheet.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 Essencial
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list'; // Se for usar <mat-list>

@Component({
  standalone: true,
  selector: 'app-agenda-status-sheet',
  templateUrl: './agenda-status-sheet.component.html',
  styleUrls: ['./agenda-status-sheet.component.css'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule // opcional, remova se não usar
  ],
  template: `
    <div class="status-sheet">
      <button mat-button (click)="select(1)">✅ Pendente</button>
      <button mat-button (click)="select(2)">🔵 Efetivado</button>
      <button mat-button (click)="select(3)">❌ Cancelado</button>
      <button mat-button (click)="select(4)">🔴 Falta</button>
      <mat-divider></mat-divider>
      <button mat-button (click)="editar()">✏️ Editar</button>
    </div>
  `,
  styles: [`
    .status-sheet {
      display: flex;
      flex-direction: column;
      padding: 16px;
    }
    button {
      justify-content: flex-start;
      text-align: left;
    }
  `]
})
export class AgendaStatusSheetComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheetRef: MatBottomSheetRef<AgendaStatusSheetComponent>
  ) {}

  select(statusId: number) {
    this.bottomSheetRef.dismiss({ action: 'status', statusId });
  }

  editar() {
    this.bottomSheetRef.dismiss({ action: 'editar' });
  }
}
