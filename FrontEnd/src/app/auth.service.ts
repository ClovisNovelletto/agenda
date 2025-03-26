/*import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  login(username: string, password: string): void {
    // Aqui você pode fazer a chamada ao backend para autenticar
    localStorage.setItem('token', 'fake-jwt-token'); // Exemplo: salvar token
  }

  logout(): void {
    localStorage.removeItem('token'); // Remove o token do localStorage
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); // Verifica se o token existe
  }
}*/


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiURL = 'http://localhost:3000/login'; // URL do backend
  private tokenKey = 'jwt-token';

  storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): void {
    this.http.post<{ token: string }>('http://localhost:3000/login', { username, password })
      .subscribe({
        next: (response) => {
          localStorage.setItem('jwt-token', response.token); // Armazena o token
          this.router.navigate(['/home']); // Redireciona para a página Home
        },
        error: (err) => {
          console.error('Erro ao logar:', err);
          alert('Falha no login. Verifique suas credenciais.');
        }
      });
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('jwt-token');
    return !!token; // Retorna true se o token existe, false caso contrário
    //return !!localStorage.getItem('token'); // Verifica se o token existe
  }

}
