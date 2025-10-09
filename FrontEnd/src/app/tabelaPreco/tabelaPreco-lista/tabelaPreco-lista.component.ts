import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TabelaPrecoFormComponent } from '../tabelaPreco-form/tabelaPreco-form.component';
import { TabelaPrecoService } from '../../services/tabelaPreco.service';
import { TabelaPreco } from '../../models/tabelaPreco.model';
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
//import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tabelaPreco-lista',
  standalone: true,
   imports: [CommonModule, MatIconModule, MatNativeDateModule, MatSlideToggleModule, MatButtonToggleModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatMenuModule /*,IonicModule*/] , // Adicione o RouterModule aqui]
  templateUrl: './tabelaPreco-lista.component.html',
  styleUrls: ['./tabelaPreco-lista.component.css'], 
})
export class TabelaPrecoListaComponent implements OnInit {
  filtroTexto: string = "";
  filtroStatus: string = "Todos";
  tabelaPrecos: TabelaPreco[] = [];
  tabelaPrecosFiltrados: TabelaPreco[] = [];
  ordemCrescente = true;
  constructor(private dialog: MatDialog, private tabelaPrecoService: TabelaPrecoService) {}

  ngOnInit(): void {
    this.carregarTabelaPrecos();
  }

  onEditar(tabelaPreco: TabelaPreco) {
    const isMobile = window.innerWidth < 600;
    console.log('tabelaPreco x: ', tabelaPreco);
    const dialogRef = this.dialog.open(TabelaPrecoFormComponent, {
      data: {tabelaPreco},
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log("resultado x", resultado);
        this.tabelaPrecoService.salvar(resultado).subscribe(() => this.carregarTabelaPrecos());
      }
    });
  }

  carregarTabelaPrecos() {
    this.tabelaPrecoService.listar().subscribe(lista => {
      this.tabelaPrecos = lista;
      this.aplicarFiltro();
      console.log('this.tabelaPrecosFiltrados',this.tabelaPrecosFiltrados);
    });
  }


  aplicarFiltro(): void {
  this.tabelaPrecosFiltrados = this.tabelaPrecos
    .filter(tabelaPreco => {

      const correspondeStatus = this.filtroStatus === 'Todos'
        || (this.filtroStatus === 'Ativos' && tabelaPreco.ativo)
        || (this.filtroStatus === 'Inativos' && !tabelaPreco.ativo);

      return correspondeStatus;
    })
    /*.sort((a, b) => a.nome.localeCompare(b.nome));*/ // <-- ordenação fixa por nome
  }


  novoTabelaPreco() {
    const isMobile = window.innerWidth < 600;
    const dialogRef = this.dialog.open(TabelaPrecoFormComponent, {
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.tabelaPrecoService.salvar(resultado).subscribe(() => this.carregarTabelaPrecos());
      }
    });
  }

}
