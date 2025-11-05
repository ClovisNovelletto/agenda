import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Local } from '../models/local.model';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class LocalService {

  constructor(private http: HttpClient) {}

  listar(): Observable<Local[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Local[]>(`${environment.apiUrl}/local/localLista`, { headers });
    //return this.http.get<Local[]>(this.baseUrl);
  }

  salvar(local: Local): Observable<Local> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
console.log('local: ', local);

    if (local.id) {
      //return this.http.put<Local>(`${this.baseUrl}/${local.id}`, local);
      return this.http.put<Local>(`${environment.apiUrl}/local/localSave`, local, { headers });
    } else {
      return this.http.post<Local>(`${environment.apiUrl}/local/localInsert`, local, { headers });
      //return this.http.post<Local>(this.baseUrl, local);
    }
  }
}
