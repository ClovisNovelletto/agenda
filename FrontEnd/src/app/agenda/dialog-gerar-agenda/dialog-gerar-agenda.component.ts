

import { MatDialogModule,  } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import dayjs from 'dayjs';
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlunoService } from '../../services/aluno.service';
import { startWith, map } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-dialog-gerar-agenda',
  templateUrl: './dialog-gerar-agenda.component.html',
  styleUrls: ['./dialog-gerar-agenda.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatAutocompleteModule,
    MatDialogModule,
    MatInputModule
  ]
})
export class DialogGerarAgendaComponent implements OnInit {
  meses: { label: string, dataInicio: Date, dataFim: Date }[] = [];
  mesSelecionado: any;
  titulo: string = "Gerar Recebimentos do Mês";
  mensagem: string = "Selecione um mês para gerar os recebimentos com base nos Aluno Planos ativos cadastrados";
  
  form!: FormGroup;
  selectedAluno: number | null = null;
  alunos: any[] = [];
    alunoCtrl = new FormControl('', null);
    alunosFiltrados: any[] = [];
    alunoSelecionado: any = null;
    alunoEncontrado: boolean = true;

  constructor(public dialogRef: MatDialogRef<DialogGerarAgendaComponent>,
     @Inject(MAT_DIALOG_DATA) public  data: any,
    private fb: FormBuilder,
    private alunoService: AlunoService) {}

  ngOnInit(): void {
    this.carregarAlunos();
    const hoje = dayjs();
    for (let i = -6; i <= 6; i++) {
      const data = hoje.add(i, 'month');
      const inicio = data.startOf('month').toDate();
      const fim = data.endOf('month').toDate();
      const label = data.format('MM/YYYY');
      const item = { label, dataInicio: inicio, dataFim: fim };
      this.meses.push(item);

    

      if (i === 0) this.mesSelecionado = item; // Seleciona o mês atual por padrão
          
    }
    this.form = this.fb.group({
          alunoid: ['', null],
    });

    // quando o texto digitado mudar
    this.alunoCtrl.valueChanges.subscribe(nome => {
      const aluno = this.alunos.find(a => a.nome === nome);
      if (aluno) {
        // selecionou válido → seta id
        this.form.patchValue({ alunoid: aluno.id }, { emitEvent: false });
      } else {
        // digitou algo não válido → limpa id
        this.form.patchValue({ alunoid: '' }, { emitEvent: false });
      }
    });
    
    if (this.data?.titulo) {
      this.titulo = this.data.titulo;
    }
    if (this.data?.mensagem) {
      this.mensagem = this.data.mensagem;
    }
      
console.log('alunos...');
  }

  onAlunoSelected(nome: string) {
    console.log('onAlunoSelected...');
    const aluno = this.alunos.find(a => a.nome === nome);
    if (aluno) {
      console.log('alunoid: ', aluno.id);
      this.form.patchValue({ alunoid: aluno.id });
      this.alunoSelecionado = aluno;
      console.log('alunoSelecionado: ', this.alunoSelecionado);
      //this.atualizaServico(this.alunoSelecionado.servicoid);
      //this.atualizaLocal(this.alunoSelecionado.alulocalid);
    } else {
      this.form.patchValue({ alunoid: '' });
    }
  }

  confirmar() {
     const retornoDialogo: any = {
        mesSelecionado: this.mesSelecionado,
        alunoid: this.alunoSelecionado?.id || null
     }
    this.dialogRef.close(retornoDialogo);
  }

  carregarAlunos() {
    this.alunoService.alunosAtivos().subscribe(lista => {
      this.alunos = lista;
      //this.alunosFiltrados =lista;
      //console.log('this.alunosFiltrados',this.alunosFiltrados);

      this.alunoCtrl.valueChanges
        .pipe(
          startWith(''),
          map(value => value?.toLowerCase()),
          map(nome => {
            const filtrado = this.alunos.filter(a => a.nome.toLowerCase().includes(nome));
            this.alunoEncontrado = filtrado.length > 0;
            return filtrado;
          })
        )
        .subscribe(result => {
          this.alunosFiltrados = result;
        });      
    });
  }

}

