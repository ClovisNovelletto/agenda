import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Serviço de autenticação criado anteriormente

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  // Método para requisições GET protegidas
  get<T>(url: string): Observable<T> {
    const headers = this.createAuthorizationHeader();
    return this.http.get<T>(url, { headers });
  }

  // Método para requisições POST protegidas
  post<T>(url: string, body: any): Observable<T> {
    const headers = this.createAuthorizationHeader();
    return this.http.post<T>(url, body, { headers });
  }

  // Função auxiliar para criar os cabeçalhos com o token
  private createAuthorizationHeader(): HttpHeaders {
    const token = this.authService.getToken(); // Recupera o token armazenado
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
}