import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgendaTreino } from '../models/agendaTreino.model';
import { AgendaTreinoItem } from '../models/agendaTreinoItem.model';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgendaTreinoService {
  constructor(private http: HttpClient) {}

  getTreino(agendaId: number) {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<AgendaTreino[]>(`${environment.apiUrl}/agendaTreino/treino/${agendaId}`, { headers });
  }

  concluirItem(id: number, concluido: boolean) {
    console.log("id", id);
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put<AgendaTreino[]>(`${environment.apiUrl}/agendaTreino/concluirItem`, {id, concluido}, { headers });
  }

  concluirTreino(id: number, concluido: boolean) {
    console.log("id", id);
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put<AgendaTreino>(`${environment.apiUrl}/agendaTreino/concluirTreino`, {id, concluido}, { headers });
  }

  gerarAgendaTreino(payload: any) {
    console.log("payload entrou ", payload);
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<AgendaTreino>(`${environment.apiUrl}/agendaTreino/gerarAgendaTreinos`, payload, { headers });
    console.log("payload saiu", payload);
  }


}