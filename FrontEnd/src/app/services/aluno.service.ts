import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Aluno } from '../models/aluno.model';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class AlunoService {

  constructor(private http: HttpClient) {}

  listar(): Observable<Aluno[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Aluno[]>(`${environment.apiUrl}/aluno/alunoLista`, { headers });
    //return this.http.get<Aluno[]>(this.baseUrl);
  }

  salvar(aluno: Aluno): Observable<Aluno> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
console.log('aluno: ', aluno);

    if (aluno.id) {
      //return this.http.put<Aluno>(`${this.baseUrl}/${aluno.id}`, aluno);
      return this.http.put<Aluno>(`${environment.apiUrl}/aluno/alunoSave`, aluno, { headers });
    } else {
      return this.http.post<Aluno>(`${environment.apiUrl}/aluno/alunoInsert`, aluno, { headers });
      //return this.http.post<Aluno>(this.baseUrl, aluno);
    }
  }
}
