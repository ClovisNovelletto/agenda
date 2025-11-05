import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Personal } from '../models/personal.model';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../src/environments/environment';

interface ConfigPersonal {
  diasAtendimento: number[];
  horaInicio: number;
  horaFim: number;
  intervaloMinutos: number;
  mostrarLocal: boolean;
  mostrarServico: boolean;
  mostrarEquipto: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  constructor(private http: HttpClient) {}

  getConfiguracoes(): Observable<Personal> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Personal>(`${environment.apiUrl}/personal/personal/me`, { headers });
  }

  salvarConfiguracoes(config: ConfigPersonal): Observable<any> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put(`${environment.apiUrl}/personal/personal/configuracoes`, config, { headers });
  }
    
  getMe(): Observable<Personal> {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Personal>(`${environment.apiUrl}/personal/personal/me`, { headers });
  }
}
