import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assinatura } from '../models/assinatura.model';
import { AssinaturaPagto } from '../models/assinaturaPagto.model';
import { Plano } from '../models/plano.model';
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
/*
    getConfiguracoes(): Observable<Personal> {
      const token = localStorage.getItem('jwt-token');
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.get<Personal>(`${environment.apiUrl}/personal/personal/me`, { headers });
    }
*/
  carregaDadosPlano(): Observable<Assinatura[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Assinatura[]>(`${environment.apiUrl}/assinatura/dadosPlano`, { headers });
  }

  carregaAssinaturaPagtos(): Observable<AssinaturaPagto[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<AssinaturaPagto[]>(`${environment.apiUrl}/assinatura/dadosPagtos`, {}, { headers });
  }
  
  carregaPlanos(): Observable<Plano[]> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<Plano[]>(`${environment.apiUrl}/assinatura/carregaPlanos`, {}, { headers });
  }

  assinaturaCriarPgtoPix(planoid: number): Observable<Assinatura> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    console.log('Assinatura: ');

    return this.http.post<Assinatura>(`${environment.apiUrl}/assinatura/assinaturaCriarPgtoPix`, {planoid}, { headers });

  }

}