import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgendaStatus } from '../models/agendaStatus.model';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../src/environments/environment';

interface ConfigPersonal {
  diasAtendimento: number[];
  horaInicio: number;
  horaFim: number;
  intervaloMinutos: number;
}

@Injectable({
  providedIn: 'root'
})
export class AgendaStatusService {
  constructor(private http: HttpClient) {}

  getStatus(): Observable<AgendaStatus[]> {
  const token = localStorage.getItem('jwt-token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  return this.http.get<AgendaStatus[]>(`${environment.apiUrl}/agendaStatus`, { headers });
}

//  getStatus(): Observable<AgendaStatus> {
//    const token = localStorage.getItem('jwt-token');
//    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
//    return this.http.get<AgendaStatus>(`${environment.apiUrl}/agendaStatus`, { headers });
//    return this.http.get<AgendaStatus[]>(`${environment.apiUrl}/agendaStatus`, { headers });
 

}
