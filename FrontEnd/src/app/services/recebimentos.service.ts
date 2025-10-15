import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recebimento } from '../models/recebimento.model';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http'

export interface Aluno {
  id: number;
  nome: string;
  ativo?: boolean;
  mostrarEquipto: boolean;
}

export interface PrecoTabela {
  valorTabela: number;
}

@Injectable({
  providedIn: 'root',
})
export class RecebimentosService {

  constructor(private http: HttpClient) {}

  getAlunosAtivos(personalid: number): Observable<Aluno[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Aluno[]>(`${environment.apiUrl}/alunoLista`, { headers });
  }

  carregaRecebAluno(payload: {alunoid: number, ano: number}): Observable<Recebimento[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<Recebimento[]>(`${environment.apiUrl}/recebimentoAlunoLista`, payload, { headers });
  }

  listar(payload: {ano: number, mes1a12: number}): Observable<Recebimento[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<Recebimento[]>(`${environment.apiUrl}/recebimentoLista`, payload, { headers });
  }

  salvar(recebimento: Recebimento): Observable<Recebimento> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    console.log('Recebimento: ', recebimento);

    if (recebimento.id) {
      return this.http.put<Recebimento>(`${environment.apiUrl}/recebimentoSave`, recebimento, { headers });
    } else {
      return this.http.post<Recebimento>(`${environment.apiUrl}/recebimentoInsert`, recebimento, { headers });
    }
  }

  getValorTabela(payload: {alunoid: number, planoid: number, frequenciaid: number}): Observable<PrecoTabela[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<PrecoTabela[]>(`${environment.apiUrl}/precoTabela`, payload, { headers });
  }
}