// agenda-status-sheet.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 Essencial
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list'; // Se for usar <mat-list>
import { AuthService } from '../../auth.service';

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

export class AgendaStatusSheetComponent implements OnInit {
  acessoPersonal: Boolean = false; 
    
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheetRef: MatBottomSheetRef<AgendaStatusSheetComponent>, private authService: AuthService,

  ) {}

  ngOnInit(): void {
    if(this.authService.getPersonalId() ?? 0 > 0){
      this.acessoPersonal = true
    }
    console.log('getp', this.authService.getPersonalId());
    console.log('acessop',this.acessoPersonal);
    console.log("data", this.data)
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
