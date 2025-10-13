import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecebGeral } from '../models/recebGeral.model';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http'

export interface PrecoTabela {
  valorTabela: number;
}

@Injectable({
  providedIn: 'root',
})
export class RecebGeralService {

  constructor(private http: HttpClient) {}
/*
    getAulasDoAlunoMes(payload: {alunoid: number, ano: number, mes1a12: number}): Observable<Aula[]> {
      const token = localStorage.getItem('jwt-token');
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.post<Aula[]>(`${environment.apiUrl}/agendaAluno`, payload, { headers });
    }*/

  listar(payload: {ano: number, mes1a12: number}): Observable<RecebGeral[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<RecebGeral[]>(`${environment.apiUrl}/recebGeralLista`, payload, { headers });
  }

  salvar(recebGeral: RecebGeral): Observable<RecebGeral> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    console.log('RecebGeral: ', recebGeral);

    if (recebGeral.id) {
      return this.http.put<RecebGeral>(`${environment.apiUrl}/recebGeralSave`, recebGeral, { headers });
    } else {
      return this.http.post<RecebGeral>(`${environment.apiUrl}/recebGeralInsert`, recebGeral, { headers });
    }
  }

  getValorTabela(payload: {alunoid: number, planoid: number, frequenciaid: number}): Observable<PrecoTabela[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<PrecoTabela[]>(`${environment.apiUrl}/precoTabela`, payload, { headers });
  }
}