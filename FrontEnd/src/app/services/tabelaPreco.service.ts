import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TabelaPreco } from '../models/tabelaPreco.model';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class TabelaPrecoService {

  constructor(private http: HttpClient) {}

  listar(): Observable<TabelaPreco[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<TabelaPreco[]>(`${environment.apiUrl}/tabelaPrecoLista`, { headers });
  }

  salvar(tabelaPreco: TabelaPreco): Observable<TabelaPreco> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
console.log('tabelaPreco: ', tabelaPreco);

    if (tabelaPreco.id) {
      return this.http.put<TabelaPreco>(`${environment.apiUrl}/tabelaPrecoSave`, tabelaPreco, { headers });
    } else {
      return this.http.post<TabelaPreco>(`${environment.apiUrl}/tabelaPrecoInsert`, tabelaPreco, { headers });
    }
  }
}
