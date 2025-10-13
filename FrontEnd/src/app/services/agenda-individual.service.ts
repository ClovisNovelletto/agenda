import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http'

export interface Aluno {
  id: number;
  nome: string;
  ativo?: boolean;
  mostrarEquipto: boolean;
}

export type StatusAula = 'CONFIRMADA' | 'PENDENTE' | 'CANCELADA';

export interface Aula {
  id: number;
  // ISO string, ex: 2025-08-21T08:00:00
  date: string;
  hour: string;
  equipto?: string | null;
  descricao?: string | null;
}

@Injectable({
  providedIn: 'root',
})

export class AgendaService {
  constructor(private http: HttpClient) {}

  getAlunosAtivos(personalid: number): Observable<Aluno[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Aluno[]>(`${environment.apiUrl}/alunoLista`, { headers });
    //const params = new HttpParams().set('personalid', personalid);
    //return this.http.get<Aluno[]>('/api/alunos/ativos', { params });
  }

  //getAulasDoAlunoMes(alunoid: number, ano: number, mes1a12: number): Observable<Aula[]> {
  getAulasDoAlunoMes(payload: {alunoid: number, ano: number, mes1a12: number}): Observable<Aula[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<Aula[]>(`${environment.apiUrl}/agendaAluno`, payload, { headers });
  }
}
