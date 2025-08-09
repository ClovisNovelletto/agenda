import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LocalFormComponent } from '../local-form/local-form.component';
import { LocalService } from '../../services/local.service';
import { Local } from '../../models/local.model';
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
  selector: 'app-local-lista',
  standalone: true,
   imports: [CommonModule, MatIconModule, MatNativeDateModule, MatSlideToggleModule, MatButtonToggleModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatMenuModule /*,IonicModule*/] , // Adicione o RouterModule aqui]
  templateUrl: './local-lista.component.html',
  styleUrls: ['./local-lista.component.css'], 
})
export class LocalListaComponent implements OnInit {
  filtroTexto: string = "";
  filtroStatus: string = "Todos";
  locals: Local[] = [];
  localsFiltrados: Local[] = [];
  ordemCrescente = true;
  constructor(private dialog: MatDialog, private localService: LocalService) {}

  ngOnInit(): void {
    this.carregarLocals();
  }
/*
  carregarLocals() {
    this.localService.listar().subscribe(lista => {
      this.locals = lista;
      console.log("lista", lista);
    });
  }
  */

  onEditar(local: Local) {
    const isMobile = window.innerWidth < 600;
    console.log('local: ', local);
    const dialogRef = this.dialog.open(LocalFormComponent, {
      data: {local},
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log("resultado", resultado);
        this.localService.salvar(resultado).subscribe(() => this.carregarLocals());
      }
    });
  }

  carregarLocals() {
    this.localService.listar().subscribe(lista => {
      this.locals = lista;
      this.aplicarFiltro();
      console.log('this.localsFiltrados',this.localsFiltrados);
    });
  }


  aplicarFiltro(): void {
  this.localsFiltrados = this.locals
    .filter(local => {
      const correspondeTexto = this.filtroTexto
        ? local.nome.toLowerCase().includes(this.filtroTexto.toLowerCase())
        : true;

      const correspondeStatus = this.filtroStatus === 'Todos'
        || (this.filtroStatus === 'Ativos' && local.ativo)
        || (this.filtroStatus === 'Inativos' && !local.ativo);

      return correspondeTexto && correspondeStatus;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome)); // <-- ordenação fixa por nome
  }
/*
  aplicarFiltro() {
  this.localsFiltrados = this.locals.filter(local => {
    const filtStatus = (this.filtroStatus === "Ativos" ? true : false);
    const condTexto = local.nome.toLowerCase().includes(this.filtroTexto.toLowerCase().trim()) ||
                      local.telefone.includes(this.filtroTexto.trim());

    const condStatus = this.filtroStatus == "Todos" || local.ativo == filtStatus;


    return condTexto && condStatus;
  });
}
*/

/*  
  aplicarFiltro() {
    const texto = this.filtroTexto.toLowerCase().trim();
    const status = this.filtroStatus;

    this.localsFiltrados = this.locals.filter(local => {
    const condicaoTexto =
      local.nome.toLowerCase().includes(texto) ||
      local.telefone.includes(texto);

    const condicaoStatus =
      status == null ||
      (status == true && local.ativo) ||
      (status == false && !local.ativo);

    return condicaoTexto && condicaoStatus;
    });
  }
  */
  /*
  aplicarFiltro() {
    const texto = this.filtroTexto.toLowerCase();
    this.localsFiltrados = this.locals.filter(local => {
      const matchTexto =
        local.nome.toLowerCase().includes(texto) ||
        local.telefone.includes(texto);
      const matchStatus =
        this.filtroStatus === 'todos' ||
        (this.filtroStatus === 'ativos' && local.ativo) ||
        (this.filtroStatus === 'inativos' && !local.ativo);
      return matchTexto && matchStatus;
    });
  }
  */

  novoLocal() {
    const isMobile = window.innerWidth < 600;
    const dialogRef = this.dialog.open(LocalFormComponent, {
      width: isMobile ? '100vw' : '500px',
      height: isMobile ? '100vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.localService.salvar(resultado).subscribe(() => this.carregarLocals());
      }
    });
  }



ordenarPor(campo: keyof Local) {
  this.locals.sort((a, b) => {
    const valorA = a[campo]?.toString().toLowerCase() || '';
    const valorB = b[campo]?.toString().toLowerCase() || '';
    return this.ordemCrescente ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
  });

  this.ordemCrescente = !this.ordemCrescente;
}

}
