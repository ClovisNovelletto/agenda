import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assinatura } from '../models/assinatura.model';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http'


@Injectable({
  providedIn: 'root',
})
export class AssinaturaService {

  constructor(private http: HttpClient) {}

  carregaAssinatura(): Observable<Assinatura[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<Assinatura[]>(`${environment.apiUrl}/assinatura/assinaturaLista`, {}, { headers });
  }

  assinaturaCriarPgtoPix(): Observable<Assinatura> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    console.log('Assinatura: ');

    return this.http.post<Assinatura>(`${environment.apiUrl}/assinatura/assinaturaCriarPgtoPix`, null, { headers });

  }

}