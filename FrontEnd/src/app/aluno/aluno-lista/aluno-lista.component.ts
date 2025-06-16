import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlunoFormComponent } from '../aluno-form/aluno-form.component';
import { AlunoService } from '../../services/aluno.service';
import { Aluno } from '../../models/aluno.model';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { NgModule } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-aluno-lista',
   imports: [CommonModule, MatIconModule, MatNativeDateModule, MatSlideToggleModule, MatButtonToggleModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule], // Adicione o RouterModule aqui]
  templateUrl: './aluno-lista.component.html',
  styleUrls: ['./aluno-lista.component.css'] 
})
export class AlunoListaComponent implements OnInit {
  filtroTexto: string = '';
  filtroStatus: 'todos' | 'ativos' | 'inativos' = 'todos';
  alunos: Aluno[] = [];
  alunosFiltrados: Aluno[] = [];

  constructor(private dialog: MatDialog, private alunoService: AlunoService) {}

  ngOnInit(): void {
    this.carregarAlunos();
  }
/*
  carregarAlunos() {
    this.alunoService.listar().subscribe(lista => {
      this.alunos = lista;
      console.log("lista", lista);
    });
  }
  */

  onEditar(aluno: Aluno) {
    const isMobile = window.innerWidth < 600;
    console.log('aluno: ', aluno);
    const dialogRef = this.dialog.open(AlunoFormComponent, {
      data: {aluno},
      width: isMobile ? '100vw' : '500px',
      height: isMobile ? '100vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log("resultado", resultado);
        this.alunoService.salvar(resultado).subscribe(() => this.carregarAlunos());
      }
    });
  }

  carregarAlunos() {
    this.alunoService.listar().subscribe(lista => {
      this.alunos = lista;
      this.aplicarFiltro();
    });
  }

  aplicarFiltro() {
    const texto = this.filtroTexto.toLowerCase();
    this.alunosFiltrados = this.alunos.filter(aluno => {
      const matchTexto =
        aluno.nome.toLowerCase().includes(texto) ||
        aluno.telefone.includes(texto);
      const matchStatus =
        this.filtroStatus === 'todos' ||
        (this.filtroStatus === 'ativos' && aluno.ativo) ||
        (this.filtroStatus === 'inativos' && !aluno.ativo);
      return matchTexto && matchStatus;
    });
  }

  novoAluno() {
    const isMobile = window.innerWidth < 600;
    const dialogRef = this.dialog.open(AlunoFormComponent, {
      width: isMobile ? '100vw' : '500px',
      height: isMobile ? '100vh' : 'auto',
      panelClass: isMobile ? 'full-screen-dialog' : ''
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.alunoService.salvar(resultado).subscribe(() => this.carregarAlunos());
      }
    });
  }

}
