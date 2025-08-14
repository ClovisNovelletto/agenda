import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipto } from '../models/equipto.model';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class EquiptoService {

  constructor(private http: HttpClient) {}

  listar(): Observable<Equipto[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Equipto[]>(`${environment.apiUrl}/equiptoLista`, { headers });
    //return this.http.get<Local[]>(this.baseUrl);
  }

  salvar(equipto: Equipto): Observable<Equipto> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
console.log('equipto: ', equipto);

    if (equipto.id) {
      return this.http.put<Equipto>(`${environment.apiUrl}/equiptoSave`, equipto, { headers });
    } else {
      return this.http.post<Equipto>(`${environment.apiUrl}/equiptoInsert`, equipto, { headers });
    }
  }
}
