import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Treino } from '../models/treino.model';
import { TreinoItem } from '../models/treinoItem.model';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http'


@Injectable({
  providedIn: 'root',
})
export class TreinoService {

  constructor(private http: HttpClient) {}

  carregaTreinos(): Observable<Treino[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<Treino[]>(`${environment.apiUrl}/treino/treinoLista`, {}, { headers });
  }

  salvarTreino(treino: Treino): Observable<Treino> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    console.log('Treino: ', treino);

    if (treino.id) {
      return this.http.put<Treino>(`${environment.apiUrl}/treino/treinoSave`, treino, { headers });
    } else {
      return this.http.post<Treino>(`${environment.apiUrl}/treino/treinoInsert`, treino, { headers });
    }
  }


  carregaTreinosItens(payload: {treinoid: number}): Observable<TreinoItem[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    console.log("payload", payload);
    return this.http.post<TreinoItem[]>(`${environment.apiUrl}/treino/treinoItemLista`, payload, { headers });
  }

  salvarItem(treinoItem: TreinoItem): Observable<TreinoItem> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    console.log('TreinoItem: ', treinoItem);

    if (treinoItem.id) {
      return this.http.put<TreinoItem>(`${environment.apiUrl}/treino/treinoItemSave`, treinoItem, { headers });
    } else {
      return this.http.post<TreinoItem>(`${environment.apiUrl}/treino/treinoItemInsert`, treinoItem, { headers });
    }
  }

}