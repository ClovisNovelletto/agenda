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

export interface Aula {
  id: number;
  // ISO string, ex: 2025-08-21T08:00:00
  date: string;
  hour: string;
  equipto?: string | null;
  descricao?: string | null;
}

export interface Anamnese {
    id: number;
    data: Date;
    titulo: string;
    peso: number;
    altura: number;
    idade: number;
    objetivo: string;
    pricipalRecl: string;
    descricao: Text;
    aluno: string;
}

@Injectable({
  providedIn: 'root',
})

export class AnamneseService {
  constructor(private http: HttpClient) {}

  getAlunosAtivos(personalid: number): Observable<Aluno[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Aluno[]>(`${environment.apiUrl}/alunoLista`, { headers });
  }

  getAnamnesesAluno(payload: {alunoid: number}): Observable<Anamnese[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<Anamnese[]>(`${environment.apiUrl}/anamnesesLista`, payload, { headers });
  }


  salvar(anamnese: Anamnese): Observable<Aluno> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
console.log('anamnese: ', anamnese);

    if (anamnese.id) {
      //return this.http.put<Aluno>(`${this.baseUrl}/${aluno.id}`, aluno);
      return this.http.put<Aluno>(`${environment.apiUrl}/anamneseSave`, anamnese, { headers });
    } else {
      return this.http.post<Aluno>(`${environment.apiUrl}/anamneseInsert`, anamnese, { headers });
      //return this.http.post<Aluno>(this.baseUrl, aluno);
    }
  }
}