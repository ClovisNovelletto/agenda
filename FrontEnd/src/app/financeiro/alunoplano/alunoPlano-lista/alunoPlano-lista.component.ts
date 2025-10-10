import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlunoPlanoFormComponent } from '../alunoPlano-form/alunoPlano-form.component';
import { AlunoPlanoService } from '../../../services/alunoPlano.service';
import { AlunoPlano } from '../../../models/alunoPlano.model';
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
  selector: 'app-alunoplano-lista',
  standalone: true,
   imports: [CommonModule, MatIconModule, MatNativeDateModule, MatSlideToggleModule, MatButtonToggleModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatMenuModule /*,IonicModule*/] , // Adicione o RouterModule aqui]
  templateUrl: './alunoPlano-lista.component.html',
  styleUrls: ['./alunoPlano-lista.component.css'], 
})
export class AlunoPlanoListaComponent implements OnInit {
  filtroTexto: string = "";
  filtroStatus: string = "Todos";
  alunoPlanos: AlunoPlano[] = [];
  alunoPlanosFiltrados: AlunoPlano[] = [];
  ordemCrescente = true;
  constructor(private dialog: MatDialog, private alunoPlanoService: AlunoPlanoService) {}

  ngOnInit(): void {
    this.carregarAlunoPlanos();
  }

  onEditar(alunoPlano: AlunoPlano) { 
    const isMobile = window.innerWidth < 600;
    console.log('alunoPlano: ', alunoPlano);
    const dialogRef = this.dialog.open(AlunoPlanoFormComponent, {
      data: {alunoPlano},
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log("resultado", resultado);
        this.alunoPlanoService.salvar(resultado).subscribe(() => this.carregarAlunoPlanos());
      }
    });
  }

  carregarAlunoPlanos() {
    this.alunoPlanoService.listar().subscribe(lista => {
      this.alunoPlanos = lista;
      this.aplicarFiltro();
      console.log('this.alunoPlanosFiltrados',this.alunoPlanosFiltrados);
    });
  }

/*
  this.alunosFiltrados = this.alunos
    .filter(aluno => {
      const correspondeTexto = this.filtroTexto
        ? aluno.nome.toLowerCase().includes(this.filtroTexto.toLowerCase())
        : true;

      const correspondeStatus = this.filtroStatus === 'Todos'
        || (this.filtroStatus === 'Ativos' && aluno.ativo)
        || (this.filtroStatus === 'Inativos' && !aluno.ativo);

      return correspondeTexto && correspondeStatus;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome)); // <-- ordenação fixa por nome
*/
  aplicarFiltro(): void {
  this.alunoPlanosFiltrados = this.alunoPlanos
    .filter(alunoPlano => {

      const correspondeTexto = this.filtroTexto
        ? alunoPlano.aluno.toLowerCase().includes(this.filtroTexto.toLowerCase())
        : true;

      const correspondeStatus = this.filtroStatus === 'Todos'
        || (this.filtroStatus === 'Ativos' && alunoPlano.status === 'Ativo')
        || (this.filtroStatus === 'Finalizados' && alunoPlano.status === 'Finalizado')
        || (this.filtroStatus === 'Cancelados' && alunoPlano.status === 'Cancelado');

      return correspondeTexto && correspondeStatus;
    })
  }


  novoAlunoPlano() {
    const isMobile = window.innerWidth < 600; 
    const dialogRef = this.dialog.open(AlunoPlanoFormComponent, {
      width: isMobile ? '90vw' : '500px',
      height: isMobile ? '90vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.alunoPlanoService.salvar(resultado).subscribe(() => this.carregarAlunoPlanos());
      }
    });
  }



  ordenarPor(campo: keyof AlunoPlano) {
    this.alunoPlanos.sort((a, b) => {
      const valorA = a[campo]?.toString().toLowerCase() || '';
      const valorB = b[campo]?.toString().toLowerCase() || '';
      return this.ordemCrescente ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
    });

    this.ordemCrescente = !this.ordemCrescente;
  }

}
