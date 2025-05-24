import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private apiUrl = 'https://localhost:4200/agenda'; // URL da sua API

  constructor(private http: HttpClient) {}

  // Método para buscar aulas do banco
  getAulasAgendadas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}