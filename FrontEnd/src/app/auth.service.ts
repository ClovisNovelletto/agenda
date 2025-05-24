import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiURL = 'http://localhost:3000/login'; // URL do backend
  private tokenKey = 'jwt-token';
  private loggedIn = new BehaviorSubject<boolean>(false); // Estado inicial
  public isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();


  // Observable que outros componentes podem acessar
  //isLoggedIn$ = this.loggedIn.asObservable();



  storeToken(token: string): void {
    console.log('AS storeToken');
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    console.log('AS getToken');
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    console.log('AS clearToken');
    localStorage.removeItem(this.tokenKey);
  }

  constructor(private http: HttpClient, private router: Router) {this.setaStatusLogin();}

  login(username: string, password: string): void {
    console.log('AS login');
    this.http.post<{ token: string }>('http://localhost:3000/login', { username, password })
      .subscribe({
        next: (response) => {
          localStorage.setItem('jwt-token', response.token); // Armazena o token
          this.setaStatusLogin();
          this.router.navigate(['/home']); // Redireciona para a página Home
        },
        error: (err) => {
          console.error('Erro ao logar:', err);
          alert('Falha no login. Verifique suas credenciais.');
        }
      });
  }

  logout(): void {
    console.log('AS logout');
    localStorage.removeItem('token');
    localStorage.removeItem('jwt-token');
    this.setaStatusLogout();
  }

  setaStatusLogin(): void {
    console.log('AS setaStatusLogin');
    this.loggedIn.next(true); // Atualizar estado para logado
  }
  setaStatusLogout() {
    console.log('AS setaStatusLogout');
    this.loggedIn.next(false); // Atualizar estado para logado
  }
  isLoggedIn() {
    console.log('AS isLoggedIn');
    // Checa o estado inicial com base no token
    return !!localStorage.getItem('jwt-token');
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.tipo ?? null;
  }

  getPersonalId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.personalId ?? null;
  }

  getAlunoId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.alunoId ?? null;
  }

}
