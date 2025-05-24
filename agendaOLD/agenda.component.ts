import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, model } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { AgendaService } from './agenda.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatGridListModule} from '@angular/material/grid-list';

import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

/** @title Datepicker inline calendar example */
@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css',
  providers: [provideNativeDateAdapter()],
  imports: [MatCardModule, MatDatepickerModule, MatListModule, MatIconModule, MatExpansionModule, CommonModule, MatToolbarModule, MatGridListModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaComponent {
  selected = model<Date | null>(null);
  constructor(private agendaService: AgendaService) {}

  tiles: Tile[] = [
    { text: '01/04/2025', cols: 4, rows: 1, color: 'red' },
    { text: '02/04/2025', cols: 4, rows: 1, color: 'red' },
    { text: '03/04/2025', cols: 4, rows: 1, color: 'red' },
    { text: '04/04/2025', cols: 4, rows: 1, color: 'red' },
    { text: '05/04/2025', cols: 4, rows: 1, color: 'red' },
    { text: '06/04/2025', cols: 4, rows: 1, color: 'red' },
    { text: '07/04/2025', cols: 4, rows: 1, color: 'red' },

//    { text: '', cols: 12, rows: 0, color: 'transparent' },

    //Data 01/04/2025 - dividida em 3 colunas
//    { text: 'Data 01 - Hora 1', cols: 1, rows: 4, color: 'red' },
//    { text: 'Data 01 - Hora 2', cols: 1, rows: 4, color: 'purple' },
//    { text: 'Data 01 - Hora 3', cols: 1, rows: 4, color: 'lightpink' },
   // { text: 'Data 01 - Hora 4', cols: 1, rows: 4, color: 'lightpink' },


    // Data 02/04/2025 - dividida em 3 colunas
    { text: 'Data 02 - Hora 1', cols: 1, rows: 4, color: 'red' },
    { text: 'Data 02 - Hora 2', cols: 1, rows: 4, color: 'purple' },
   // { text: 'Data 02 - Hora 3', cols: 1, rows: 4, color: 'lightpink' },
   // { text: 'Data 02 - Hora 4', cols: 1, rows: 4, color: 'lightpink' },

    // Data 03/04/2025 - dividida em 3 colunas
    
    { text: 'Data 03 - Hora 1', cols: 1, rows: 4, color: 'red' },
    { text: 'Data 03 - Hora 2', cols: 1, rows: 4, color: 'purple' },
//    { text: 'Data 03 - Hora 3', cols: 1, rows: 4, color: 'lightpink' },
   // { text: 'Data 03 - Hora 4', cols: 1, rows: 4, color: 'lightpink' },

  //  { text: '', cols: 12, rows: 0, color: 'transparent' },

    //Data 01/04/2025 - dividida em 3 colunas
    { text: 'Data 01 - Hora 5', cols: 1, rows: 3, color: 'red' },
    { text: 'Data 01 - Hora 6', cols: 1, rows: 3, color: 'purple' },
   // { text: 'Data 01 - Hora 7', cols: 1, rows: 3, color: 'lightpink' },
   // { text: 'Data 01 - Hora 8', cols: 1, rows: 3, color: 'lightpink' },

    // Data 02/04/2025 - dividida em 3 colunas
    { text: 'Data 02 - Hora 5', cols: 1, rows: 3, color: 'red' },
    { text: 'Data 02 - Hora 6', cols: 1, rows: 3, color: 'purple' },
   // { text: 'Data 02 - Hora 7', cols: 1, rows: 3, color: 'lightpink' },
   // { text: 'Data 02 - Hora 8', cols: 1, rows: 3, color: 'lightpink' },

    // Data 03/04/2025 - dividida em 3 colunas
    { text: 'Data 03 - Hora 5', cols: 1, rows: 3, color: 'red' },
    { text: 'Data 03 - Hora 6', cols: 1, rows: 3, color: 'purple' },
//    { text: 'Data 03 - Hora 7', cols: 1, rows: 3, color: 'lightpink' },
   // { text: 'Data 03 - Hora 8', cols: 1, rows: 3, color: 'lightpink' },   
  ];

  //aulasAgendadas = []; // Inicializa como um array vazio
  aulasAgendadas: { titulo: string; data: Date, descricao: string} [] = [] = []; // Define o tipo como 

  ngOnInit(): void {
    //this.adjustColsForTiles("Data 01");
    //this.adjustColsForTiles("Data 02");
    //this.adjustColsForTiles("Data 03");
    // Dados de exemplo (mock) para teste
    this.aulasAgendadas = [
      { titulo: '1 Aula de Matemática', data: new Date('2025-03-29'), descricao: 'testando' },
      { titulo: '2 Aula de Física', data: new Date('2025-03-30'), descricao: 'aqui vai todo o texto de outras informações' },
      { titulo: '3 Aula de Matemática', data: new Date('2025-03-29'), descricao: 'testando' },
      { titulo: '4 Aula de Física', data: new Date('2025-03-30'), descricao: 'aqui vai todo o texto de outras informações' },
      { titulo: '5 Aula de Matemática', data: new Date('2025-03-29'), descricao: 'testando' },
      { titulo: '6 Aula de Física', data: new Date('2025-03-30'), descricao: 'aqui vai todo o texto de outras informações' },
      { titulo: '7 Aula de Matemática', data: new Date('2025-03-29'), descricao: 'testando' },
      { titulo: '8 Aula de Física', data: new Date('2025-03-30'), descricao: 'aqui vai todo o texto de outras informações' },
      { titulo: '9 Aula de Matemática', data: new Date('2025-03-29'), descricao: 'testando' },
      { titulo: '10 Aula de Física', data: new Date('2025-03-30'), descricao: 'aqui vai todo o texto de outras informações' },
      { titulo: '11 Aula de Matemática', data: new Date('2025-03-29'), descricao: 'testando' },
      { titulo: '12 Aula de Física', data: new Date('2025-03-30'), descricao: 'aqui vai todo o texto de outras informações' },
      { titulo: '13 Aula de Matemática', data: new Date('2025-03-29'), descricao: 'testando' },
      { titulo: '14 Aula de Física', data: new Date('2025-03-30'), descricao: 'aqui vai todo o texto de outras informações' },
      { titulo: '15 Aula de Matemática', data: new Date('2025-03-29'), descricao: 'testando' },
      { titulo: '16 Aula de Física', data: new Date('2025-03-30'), descricao: 'aqui vai todo o texto de outras informações' }
    ];
  }

  adjustColsForTiles(titulo: string): void {
    const totalCols = 4; // Total de colunas disponíveis para o grupo

    // Filtra os tiles do grupo "Data 01"
    const data1Tiles = this.tiles.filter((tile) => {
      return tile.text && tile.text.includes(titulo); // Inclui todas as tiles válidas do grupo
    });

    const activeTiles = data1Tiles.length;

    console.log('Número correto de tiles visíveis:', activeTiles); // Log para depuração

    if (activeTiles > 0) {
      const baseCols = Math.floor(totalCols / activeTiles); // Espaço base por tile
      const remainingCols = totalCols % activeTiles; // Espaço restante para redistribuir

      // Atualiza todas as tiles redistribuindo o espaço uniformemente
      data1Tiles.forEach((tile, index) => {
        tile.cols = baseCols; // Todas as tiles começam com o valor base

        // Distribui as colunas extras igualmente
        if (index < remainingCols) {
          tile.cols += 1; // Adiciona uma coluna extra às primeiras tiles
        }

        console.log(`tile ${index + 1} atualizado: ${tile.cols}`); // Depuração detalhada
      });
    }
  }
}



//{ titulo: 'Aula de Matemática', data: new Date('2025-03-29') },
//{ titulo: 'Aula de Física', data: new Date('2025-03-30') },
//{ titulo: 'Aula de Matemática', data: this.datePipe.transform(new Date('2025-03-29'), 'shortDate') },
//{ titulo: 'Aula de Física', data: this.datePipe.transform(new Date('2025-03-30'), 'shortDate') },