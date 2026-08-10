import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgendaStatus } from '../models/agendaStatus.model';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface AssinaturaVencida {
  codigo: number;
  mensagem: string;
}

export interface AgendaPorPeriodoResponse {
  agenda_id: BigInteger;
  date: string;
  start: string;
  hour: string;
  alunoid: number;
  aluno: string;
  localid: number;
  local: string;
  personalid: number;
  statusid: number | null;
  servicoid: number;
  servico: string;
  equiptoid: number;
  equipto: string;
  descricao: string;
}

export interface AgendaEdicaoResponse {
      agenda_id: BigInteger;
      date: string;
      alunoid: number;
      localid: number;
      aluno: string;
      local: string;
      data: Date;
      statusid: number;
      servicoid: number;
      servico: string;
      hour: string;
      equiptoid: number;
      equipto: string;
      descricao: string;
      personalid: number;
}

/*usado no agenda individual */
export interface Aula {
  id: number;
  // ISO string, ex: 2025-08-21T08:00:00
  date: string;
  hour: string;
  equipto?: string | null;
  descricao?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  constructor(private http: HttpClient) {}
  
  gerarAgenda(payload: any): Observable<AssinaturaVencida> {
    return this.http.post<AssinaturaVencida>(
        `${environment.apiUrl}/agenda/agendaGerar`,
        payload
    );
  }

  listarPorPeriodo(payload: any): Observable<AgendaPorPeriodoResponse[]> {
    return this.http.post<AgendaPorPeriodoResponse[]>(
      `${environment.apiUrl}/agenda/agendaPorPeriodo`,
      payload
    );
  }

  inserirCompromisso(compromisso: any): Observable<AgendaEdicaoResponse> {
    return this.http.post<AgendaEdicaoResponse>(
      `${environment.apiUrl}/agenda/agendaIns`,
      compromisso
    );
  }

  salvarCompromisso(compromisso: any): Observable<void> {
    return this.http.put<void>(
      `${environment.apiUrl}/agenda/agendaUpAll`,
      compromisso
    );
  }

  salvarDescricao(compromisso: any): Observable<void> {
    return this.http.put<void>(
      `${environment.apiUrl}/agenda/agendaUpDescricao`,
      compromisso
    );
  }

  salvarStatus(compromisso: any): Observable<void> {
    return this.http.put<void>(
      `${environment.apiUrl}/agenda/agendaUpStatus`,
      compromisso
    );
  }  

  getAulasDoAlunoMes(payload: {alunoid: number, ano: number, mes1a12: number}): Observable<Aula[]> {
    return this.http.post<Aula[]>(`${environment.apiUrl}/agenda/agendaAluno`, payload);
  }
}
