import { Component } from '@angular/core';
import { PersonalService } from '../services/personal.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // necessário para *ngIf, *ngFor etc.
import { FormsModule } from '@angular/forms'; // se estiver usando ngModel
import { Personal } from '../models/personal.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

interface ConfigPersonal {
  diasAtendimento: number[];
  horaInicio: number;
  horaFim: number;
  intervaloMinutos: number;
}

@Component({
  standalone: true,
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.css'],
  imports: [CommonModule, HttpClientModule, FormsModule], // ✅ ajustado
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
          horaInicio: configSelecionada.hora_inicio,
          horaFim: configSelecionada.hora_fim,
          intervaloMinutos: configSelecionada.intervalo_minutos
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
      intervaloMinutos: configSelecionada.intervalo_minutos
    }))
  ).subscribe(config => {
    this.configSelecionada = config;
  });
}

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
  this.router.navigate(['/agenda']); // ou a rota que quiser
}

}
