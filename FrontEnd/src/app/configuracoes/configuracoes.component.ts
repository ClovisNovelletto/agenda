import { Component } from '@angular/core';
import { PersonalService } from '../services/personal.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // necessário para *ngIf, *ngFor etc.
import { FormsModule } from '@angular/forms'; // se estiver usando ngModel
import { Personal } from '../models/personal.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';

interface ConfigPersonal {
  diasAtendimento: number[];
  horaInicio: number;
  horaFim: number;
  intervaloMinutos: number;
  mostrarLocal: boolean;
  mostrarServico: boolean;
  mostrarEquipto: boolean;
}

@Component({
  standalone: true,
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.css'],
  imports: [CommonModule, HttpClientModule, FormsModule, MatFormFieldModule,MatToolbarModule,MatIconModule,MatInputModule,MatSelectModule,MatCheckboxModule,MatCardModule], // ✅ ajustado
})
export class ConfiguracoesComponent {
  diasSemana = [
    { nome: 'Domingo', valor: 0 },
    { nome: 'Segunda', valor: 1 },
    { nome: 'Terça', valor: 2 },
    { nome: 'Quarta', valor: 3 },
    { nome: 'Quinta', valor: 4 },
    { nome: 'Sexta', valor: 5 },
    { nome: 'Sábado', valor: 6 },
  ];

  diasSelecionados = {
    0: false,
    1: true,
    2: true,
    3: false,
    4: false,
    5: false,
    6: false,
  };
  configSelecionada?:  ConfigPersonal;
  isSaving = false;
  mensagem: string | null = null;
  horasPossiveis: number[] = [];

  constructor(private personalService: PersonalService, private router: Router) {}

  ngOnInit(): void {
    // Exemplo: preencher das 6h às 22h
    /// log inicio
    this.personalService.getConfiguracoes().pipe(
      map(configSelecionada => {
        console.log('CONFIG DO BACKEND:', configSelecionada);

        return {
          diasAtendimento: [0,1,2,3,4,5,6].filter(i => (configSelecionada as any)[`dia${i}`]),
          horaInicio: configSelecionada?.hora_inicio,
          horaFim: configSelecionada?.hora_fim,
          intervaloMinutos: configSelecionada.intervalo_minutos,
          mostrarLocal: configSelecionada.mostrarLocal, 
          mostrarServico: configSelecionada.mostrarServico,
          mostrarEquipto: configSelecionada.mostrarEquipto
        };
      })
    ).subscribe(config => {
      console.log('CONFIG FORMATADA:', config);
      this.configSelecionada = config;
    });
    /// log final
    this.horasPossiveis = Array.from({length: 17}, (_, i) => i + 6);    
    this.personalService.getConfiguracoes().pipe(
    map(configSelecionada => ({
      diasAtendimento: [0,1,2,3,4,5,6].filter(i => (configSelecionada as any)[`dia${i}`]),
      horaInicio: configSelecionada.hora_inicio,
      horaFim: configSelecionada.hora_fim,
      intervaloMinutos: configSelecionada.intervalo_minutos,
      mostrarLocal: configSelecionada.mostrarLocal,
      mostrarServico: configSelecionada.mostrarServico,
      mostrarEquipto: configSelecionada.mostrarEquipto,
    }))
  ).subscribe(config => {
    this.configSelecionada = config;
  });
}
/*
toggleDia(dia: number) {
  this.diasSelecionados[dia] = !this.diasSelecionados[dia];
}
*/
salvarConfiguracoes(): void {
  if (!this.configSelecionada) return;

  this.isSaving = true;
  this.mensagem = null;

  this.personalService.salvarConfiguracoes(this.configSelecionada).subscribe({
    next: () => {
      this.mensagem = '✅ Configurações salvas com sucesso!';
      this.isSaving = false;
      setTimeout(() => this.mensagem = null, 3000);
    },
    error: () => {
      this.mensagem = '❌ Erro ao salvar configurações.';
      this.isSaving = false;
      setTimeout(() => this.mensagem = null, 4000);
    }
  });
  setTimeout(() => {
      this.fechar();
    }, 500);
  
}


toggleDia(dia: number): void {
  if (!this.configSelecionada) return;

  const index = this.configSelecionada.diasAtendimento.indexOf(dia);
  if (index > -1) {
    this.configSelecionada.diasAtendimento.splice(index, 1);
  } else {
    this.configSelecionada.diasAtendimento.push(dia);
  }
}

fechar(): void {
  this.router.navigate(['/home']); // ou a rota que quiser
}

}
