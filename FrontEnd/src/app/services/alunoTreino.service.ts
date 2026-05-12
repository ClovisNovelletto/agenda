import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlunoTreino } from '../models/alunoTreino.model';
import { Treino } from '../models/treino.model';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http'

export interface Aluno {
  id: number;
  nome: string;
  ativo?: boolean;
  mostrarEquipto: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AlunoTreinoService {

  constructor(private http: HttpClient) {}

  getAlunosAtivos(personalid: number): Observable<Aluno[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Aluno[]>(`${environment.apiUrl}/aluno/alunoLista`, { headers });
  }

  carregaTreinos(): Observable<Treino[]> {
      const token = localStorage.getItem('jwt-token');
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.post<Treino[]>(`${environment.apiUrl}/treino/treinoLista`, {}, { headers });
  }

  carregaAlunosTreinos(payload: {alunoid: number, ano: number, mes1a12: number}): Observable<AlunoTreino[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<AlunoTreino[]>(`${environment.apiUrl}/alunoTreino/alunoTreinoLista`, payload, { headers });
  }

  
  salvar(alunoTreino: AlunoTreino): Observable<AlunoTreino> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    console.log('alunoTreino: ', alunoTreino);
    console.log('alunoTreino.id: ', alunoTreino.id);
    if (alunoTreino.id) {
      return this.http.put<AlunoTreino>(`${environment.apiUrl}/alunoTreino/alunoTreinoSave`, alunoTreino, { headers });
    } else {
      return this.http.post<AlunoTreino>(`${environment.apiUrl}/alunoTreino/alunoTreinoInsert`, alunoTreino, { headers });
    }
  }

  atualizarOrdemTreinos(treinoItem: AlunoTreino[]): Observable<void> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.put<void>(
      `${environment.apiUrl}/alunoTreino/AtualizaOrdemTreinos`,
      treinoItem,
      { headers }
    );
  }

}