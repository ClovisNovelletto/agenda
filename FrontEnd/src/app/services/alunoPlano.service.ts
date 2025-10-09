import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlunoPlano } from '../models/alunoPlano.model';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http'

export interface PrecoTabela {
  valorTabela: number;
}

@Injectable({
  providedIn: 'root',
})
export class AlunoPlanoService {

  constructor(private http: HttpClient) {}

  listar(): Observable<AlunoPlano[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<AlunoPlano[]>(`${environment.apiUrl}/alunoPlanoLista`, { headers });
  }

  salvar(alunoPlano: AlunoPlano): Observable<AlunoPlano> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    console.log('alunoPlano: ', alunoPlano);

    if (alunoPlano.id) {
      return this.http.put<AlunoPlano>(`${environment.apiUrl}/alunoPlanoSave`, alunoPlano, { headers });
    } else {
      return this.http.post<AlunoPlano>(`${environment.apiUrl}/alunoPlanoInsert`, alunoPlano, { headers });
    }
  }

  getValorTabela(payload: {alunoid: number, planoid: number, frequenciaid: number}): Observable<PrecoTabela[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<PrecoTabela[]>(`${environment.apiUrl}/precoTabela`, payload, { headers });
  }
}