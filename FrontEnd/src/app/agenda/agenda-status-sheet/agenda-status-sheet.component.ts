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
 
})
export class AgendaStatusSheetComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheetRef: MatBottomSheetRef<AgendaStatusSheetComponent>
    
  ) {console.log("data", data);
    
  }

  
  select(statusid: number) {
    this.bottomSheetRef.dismiss({ action: 'status', statusid });
  }

  editar() {
    this.bottomSheetRef.dismiss({ action: 'editar' });
  }

  descricao() {
    this.bottomSheetRef.dismiss({ action: 'descricao' });
  }

  treino() {
    this.bottomSheetRef.dismiss({ action: 'treino' });
  }
}
