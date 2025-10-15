import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import type { AlunoPlano } from '../../../models/alunoPlano.model';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MatDatepickerModule } from '@angular/material/datepicker';

import { MatOptionModule } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';
import { Observable } from 'rxjs';
import { ConfigAgenda } from '../../../models/configAgenda.model';
import { map } from 'rxjs/operators';
import { FormArray, FormControl } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { startWith } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { AlunoPlanoService } from '../../../services/alunoPlano.service';

@Component({
  selector: 'app-alunoPlano-form',
  imports: [MatInputModule, MatNativeDateModule, MatSlideToggleModule, CommonModule, MatCheckboxModule,
            ReactiveFormsModule, MatFormFieldModule, MatInputModule,  MatSlideToggleModule, MatOptionModule, MatSelectModule,
            MatButtonModule, MatDialogModule, MatIconModule, MatToolbarModule, MatDatepickerModule, MatFormField, MatAutocompleteModule], // Adicione o RouterModule aqui]
  templateUrl: './alunoPlano-form.component.html',
  styleUrls: ['./alunoPlano-form.component.css'],
})
export class AlunoPlanoFormComponent implements OnInit {
  form!: FormGroup;
  alunos: any[] = [];
  alunoCtrl = new FormControl('');
  alunosFiltrados: any[] = [];
  alunoSelecionado: any = null;
  alunoEncontrado: boolean = true;

  /*Plano = duração contrato*/
  planos = [
    { id: 1, nome: 'Experimental' },
    { id: 2, nome: 'Avulso' },
    { id: 3, nome: 'Mensal' },
    { id: 4, nome: 'Bimestral' },
    { id: 5, nome: 'Trimestral' },
    { id: 6, nome: 'Quadrimestral' },
    { id: 7, nome: 'Semestral' },
    { id: 8, nome: 'Anual' },
  ];

  /* frequencia = aula por período*/
  frequencias = [
    { id: 1, nome: '1x por Semana' },
    { id: 2, nome: '2x por Semana' },
    { id: 3, nome: '3x por Semana' },
    { id: 4, nome: '4x por Semana' },
    { id: 5, nome: '5x por Semana' },
    { id: 6, nome: '1x por Quinzena' },
    { id: 7, nome: '1x por Mês' },
    { id: 8, nome: '1x por Bimestre' },
    { id: 9, nome: '1x por Trimestre' },
    { id: 10, nome: '1x por Quadrimestre' },
    { id: 11, nome: '1x por Semestre' },
    { id: 12, nome: '1x por Ano' },
  ];

  /*forma pagamento */
  formaspagamento =[
    { id: 1, nome: 'Dinheiro'},
    { id: 2, nome: 'Pix'},
    { id: 3, nome: 'Débito'},
    { id: 4, nome: 'Crédito'},
  ]

  /*status*/
  status =[
    { id: 1, nome: 'Ativo'},
    { id: 2, nome: 'Finalizado'},
    { id: 3, nome: 'Cancelado'},
  ]
  
  constructor(
    private fb: FormBuilder, private alunoPlanoService: AlunoPlanoService,
    private dialogRef: MatDialogRef<AlunoPlanoFormComponent>,
    private http: HttpClient, private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public  data: any 
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      alunoid: ['', Validators.required],
      planoid: [null, Validators.required],
      frequenciaid: [null, Validators.required],
      dataini: [null, Validators.required],
      datafim: [null],
      valortabela: [null, Validators.required],
      valordesconto: [0.00],
      valorreceber: [null],
      diavcto: [5, Validators.required],
      formapagtoid: [2, Validators.required],
      statusid: [1, Validators.required],
    });
    //this.form.get('valorreceber')?.disable();

    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    forkJoin({
      alunos: this.http.get<any[]>(`${environment.apiUrl}/alunos`, { headers }),
    }).subscribe(({ alunos  }) => {
      this.alunos = alunos;

      // --- Inicializa autocomplete ---
      this.setupAlunoAutocomplete();

console.log("this.data", this.data)
      if (this.data?.alunoPlano) {
        const alunoSelecionado = this.alunos.find(l => l.id === this.data.alunoPlano.alunoid);

        this.alunoSelecionado = alunoSelecionado;

        // Preenche IDs no form principal
        this.form.patchValue({
          alunoid: this.data.alunoPlano.alunoid,
          dataini: this.data.alunoPlano.dataini ? new Date(this.data.alunoPlano.dataini) : null,
          datafim: this.data.alunoPlano.datafim ? new Date(this.data.alunoPlano.datafim) : null,
          planoid: this.data.alunoPlano.planoid,
          frequenciaid: this.data.alunoPlano.frequenciaid,
          valortabela: this.data.alunoPlano.valortabela,
          valordesconto: this.data.alunoPlano.valordesconto,
          valorreceber: this.data.alunoPlano.valorreceber,
          diavcto: this.data.alunoPlano.diavcto,
          formapagtoid: this.data.alunoPlano.formapagtoid,
          statusid: this.data.alunoPlano.statusid,
        });

        // Preenche nomes nos autocompletes
        this.alunoCtrl.setValue(alunoSelecionado?.nome || '');

      }

      // --- Marcar campos como dirty para habilitar botão salvar ---
      this.form.markAllAsTouched();
      //this.form.markAsDirty();

      // --- Gatilho de detecção de mudança ---
      setTimeout(() => this.cd.markForCheck());
    });
  }

  setupAlunoAutocomplete() {
    // inicializa o FormControl se ainda não tiver sido criado
    if (!this.alunoCtrl) {
      //this.alunoCtrl = new FormControl('');
      this.alunoCtrl = new FormControl(this.alunoSelecionado?.nome);
    }

    this.alunoCtrl.valueChanges
      .pipe(
        startWith(''),
        map(value => value?.toLowerCase()),
        map(nome => {
          const filtrado = this.alunos.filter(l =>
            l.nome.toLowerCase().includes(nome)
          );
          this.alunoEncontrado = filtrado.length > 0;
          return filtrado;
        })
      )
      .subscribe(result => {
        this.alunosFiltrados = result;
      });
  }

  salvar() {
    if (this.form.valid) {
      const formValue = this.form.value;

      const updated: any = {
        id: this.data?.alunoPlano?.id ?? null,
        planoid: formValue.planoid,
        frequenciaid: formValue.frequenciaid,
        dataini: formValue.dataini,
        datafim: formValue.datafim,
        alunoid: this.alunoSelecionado?.id,
        valortabela: formValue.valortabela,
        valordesconto: formValue.valordesconto,
        valorreceber: formValue.valorreceber,
        diavcto: formValue.diavcto,
        formapagtoid: formValue.formapagtoid,
        statusid: formValue.statusid,
      };

      console.log('updated:', updated);
      this.dialogRef.close(updated);
    }
  }
  
  fechar() {
    this.dialogRef.close();
  }

  onAlunoSelecionado(event: MatAutocompleteSelectedEvent) {
    const nomeSelecionado = event.option.value;
    const aluno = this.alunos.find(l => l.nome === nomeSelecionado);
    console.log('Aluno Selecionado pelo clique:', aluno);
    if (aluno && aluno.id) {
      this.alunoCtrl.setValue(aluno.nome);
      this.form.get('alunoid')?.setValue(aluno.id);

      // Só marca como alterado se for válido
      this.form.get('alunoid')?.markAsDirty();
      this.form.get('alunoid')?.markAsTouched();
      this.form.get('alunoid')?.updateValueAndValidity();

      this.form.markAsDirty();
      this.form.updateValueAndValidity();
    } else {
      // Se limpou o campo, zera e revalida para desabilitar botão
      this.form.get('alunoid')?.reset();
      this.form.get('alunoid')?.updateValueAndValidity();
      this.form.updateValueAndValidity();
    }
  }


  onAlunoBlur() {
    const nome = this.alunoCtrl.value;
    const aluno = this.alunos.find(l => l.nome === nome);
    console.log('Aluno Selecionado ao sair do campo:', aluno);
    if (aluno && aluno.id) {
      this.alunoCtrl.setValue(aluno.nome);
      this.form.get('alunoid')?.setValue(aluno.id);
      this.alunoSelecionado = aluno;

      // Só marca como alterado se for válido
      this.form.get('alunoid')?.markAsDirty();
      this.form.get('alunoid')?.markAsTouched();
      this.form.get('alunoid')?.updateValueAndValidity();

      this.form.markAsDirty();
      this.form.updateValueAndValidity();
      this.getPrecoTabela();
    } else {
      // Se limpou o campo, zera e revalida para desabilitar botão
      this.form.get('alunoid')?.reset();
      this.form.get('alunoid')?.updateValueAndValidity();
      this.form.updateValueAndValidity();
    }
  }


  onAlunoSelected(nome: string) {
    console.log('onAlunoSelected...');
    const aluno = this.alunos.find(a => a.nome === nome);
    if (aluno) {
      console.log('alunoid: ', aluno.id);
      this.form.patchValue({ alunoid: aluno.id });
      this.alunoSelecionado = aluno;
      console.log('alunoSelecionado: ', this.alunoSelecionado);
      this.alunoCtrl.markAsDirty();
      this.alunoCtrl.markAsTouched();
    } else {
      this.form.patchValue({ alunoid: '' });
    }
  }
   
  onValorBlur() {
    const valorNull: number = 1;
    this.setPrecoTabela(valorNull);
  }

  setPrecoTabela(valor: number){

    var valorTabAtualizar;

    /*valor tabela*/
    const control_valTab = this.form.get('valortabela');
    /*seta variável com o valor do campo do formulário*/
    valorTabAtualizar = control_valTab?.value;
    /*seta variável com o valor recebido pela função, só recebe valor quando edita campo aluno */
    if(valor != 1) {
      valorTabAtualizar = valor;
    }
    /*seta valor de tabela a ser utilizado */
    const valorTab = valorTabAtualizar;
    if (valorTab !== null && valorTab !== undefined && valorTab !== '') {
      // força duas casas
      control_valTab?.setValue(parseFloat(valorTab).toFixed(2));
    }

    /*valor desconto*/
    const control_valDesc = this.form.get('valordesconto');
    const valorDesc = control_valDesc?.value;

    if (valorDesc == null || valorDesc == undefined || valorDesc == '') {
      valorDesc:  0;
    }

    if (valorDesc !== null && valorDesc !== undefined && valorDesc !== '') {
      // força duas casas
      control_valDesc?.setValue(parseFloat(valorDesc).toFixed(2));
    }

    /*valor a receber*/
    const control_valRec = this.form.get('valorreceber');
    const valorRec = (valorTab - valorDesc).toString();

    if (valorRec !== null && valorRec !== undefined && valorRec.toString() !== '') {
      // força duas casas
      control_valRec?.setValue(parseFloat(valorRec.toString()).toFixed(2));
    }
  }

  /*ao preencher o aluno, atualiza plano, frequencia, valor tabela, e valor a receber*/
  getPrecoTabela(): void {
    const alunoid = this.alunoSelecionado.id;
    const planoid = this.alunoSelecionado.planoid;
    const frequenciaid = this.alunoSelecionado.frequenciaid;

    /*atualiza campo plano*/
    const control_planoid = this.form.get('planoid');
    control_planoid?.setValue(planoid);
    /*atualiza campo frequencia*/
    const control_frequenciaid = this.form.get('frequenciaid');
    control_frequenciaid?.setValue(frequenciaid);

    const parametros = { alunoid, planoid, frequenciaid };

    this.alunoPlanoService.getValorTabela(parametros).subscribe({
      next: (res) => {
        console.log('res:', res);
        // supondo que venha um array com 1 item
        const valorTabela = res[0]?.valorTabela ?? 0;
        //console.log('res[0]?.valorTabela:', res[0]?.valorTabela);
        //console.log('Valor tabela:', valorTabela);
        this.setPrecoTabela(valorTabela);
        //this.data.alunoPlano.valor = valorTabela;
        //console.log('Valor tabela:', valorTabela);
      },
      error: (err) => {
        console.error('Erro ao obter valor tabela', err);
      }
    });
  }


}