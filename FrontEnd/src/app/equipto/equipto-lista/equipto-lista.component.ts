import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EquiptoFormComponent } from '../equipto-form/equipto-form.component';
import { EquiptoService } from '../../services/equipto.service';
import { Equipto } from '../../models/equipto.model';
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
  selector: 'app-equipto-lista',
  standalone: true,
   imports: [CommonModule, MatIconModule, MatNativeDateModule, MatSlideToggleModule, MatButtonToggleModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatMenuModule /*,IonicModule*/] , // Adicione o RouterModule aqui]
  templateUrl: './equipto-lista.component.html',
  styleUrls: ['./equipto-lista.component.css'], 
})
export class EquiptoListaComponent implements OnInit {
  filtroTexto: string = "";
  filtroStatus: string = "Todos";
  equiptos: Equipto[] = [];
  equiptosFiltrados: Equipto[] = [];
  ordemCrescente = true;
  constructor(private dialog: MatDialog, private equiptoService: EquiptoService) {}

  ngOnInit(): void {
    this.carregarEquiptos();
  }
/*
  carregarEquiptos() {
    this.equiptoService.listar().subscribe(lista => {
      this.equiptos = lista;
      console.log("lista", lista);
    });
  }
  */

  onEditar(equipto: Equipto) {
    const isMobile = window.innerWidth < 600;
    console.log('equipto: ', equipto);
    const dialogRef = this.dialog.open(EquiptoFormComponent, {
      data: {equipto},
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log("resultado", resultado);
        this.equiptoService.salvar(resultado).subscribe(() => this.carregarEquiptos());
      }
    });
  }

  carregarEquiptos() {
    this.equiptoService.listar().subscribe(lista => {
      this.equiptos = lista;
      this.aplicarFiltro();
      console.log('this.equiptosFiltrados',this.equiptosFiltrados);
    });
  }


  aplicarFiltro(): void {
  this.equiptosFiltrados = this.equiptos
    .filter(equipto => {
      const correspondeTexto = this.filtroTexto
        ? equipto.nome.toLowerCase().includes(this.filtroTexto.toLowerCase())
        : true;

      const correspondeStatus = this.filtroStatus === 'Todos'
        || (this.filtroStatus === 'Ativos' && equipto.ativo)
        || (this.filtroStatus === 'Inativos' && !equipto.ativo);

      return correspondeTexto && correspondeStatus;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome)); // <-- ordenação fixa por nome
  }

  novoEquipto() {
    const isMobile = window.innerWidth < 600;
    const dialogRef = this.dialog.open(EquiptoFormComponent, {
      width: isMobile ? '100vw' : '500px',
      height: isMobile ? '100vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.equiptoService.salvar(resultado).subscribe(() => this.carregarEquiptos());
      }
    });
  }



ordenarPor(campo: keyof Equipto) {
  this.equiptos.sort((a, b) => {
    const valorA = a[campo]?.toString().toLowerCase() || '';
    const valorB = b[campo]?.toString().toLowerCase() || '';
    return this.ordemCrescente ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
  });

  this.ordemCrescente = !this.ordemCrescente;
}

}
