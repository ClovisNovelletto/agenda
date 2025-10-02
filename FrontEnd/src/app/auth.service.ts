import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiURL = `${environment.apiUrl}/login`; // URL do backend
  private refreshURL = `${environment.apiUrl}/refresh`; // Endpoint de refresh
  private tokenKey = 'jwt-token';       // AccessToken
  private refreshKey = 'refresh-token'; // RefreshToken
  private loggedIn = new BehaviorSubject<boolean>(false);
  public isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.setaStatusLogin();
    this.startTokenWatcher(); // ativa a renovação automática
  }

  /*renovação automática do token*/ 
  startTokenWatcher(): void {
    setInterval(() => {
      const token = this.getToken();
      if (!token) return;

      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // em ms
      const now = Date.now();

      // Se faltar menos de 30 segundos, renova
      if (exp - now < 30000) {
        const token = localStorage.getItem('jwt-token');
        const headers = new HttpHeaders({Authorization: `Bearer ${token}` });  
        this.http.post<{ token: string }>(`${environment.apiUrl}/refresh`, {}, 
          { headers }
        ).subscribe({
          next: (res) => {
            console.log('Token renovado com sucesso');
            this.storeToken(res.token);
          },
          error: (err) => {
            console.error('Falha ao renovar token', err);
            this.logout();
          }
        });
      }
    }, 10000); // verifica a cada 10s
  }

  // ---------- LOGIN ----------
  login(email: string, password: string): void {
    console.log('AS login');
    this.http.post<{ accessToken: string, refreshToken: string }>(`${environment.apiUrl}/login`, { email, password })
      .subscribe({
        next: (response) => {
          localStorage.setItem(this.tokenKey, response.accessToken);
          localStorage.setItem(this.refreshKey, response.refreshToken);
          this.setaStatusLogin();
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Erro ao logar:', err);
          alert('Falha no login. Verifique suas credenciais.');
        }
      });
  }

  // ---------- LOGOUT ----------
  logout(): void {
    console.log('AS logout');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    this.setaStatusLogout();
    this.router.navigate(['/login']);
  }

  // ---------- TOKENS ----------
  storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Verifica expiração do JWT
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return true;
      const now = Math.floor(Date.now() / 1000);
      return exp < now;
    } catch (e) {
      return true;
    }
  }

  // ---------- REFRESH ----------
  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(this.refreshKey);
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Refresh token ausente'));
    }

    return this.http.post<{ accessToken: string }>(this.refreshURL, { refreshToken })
      .pipe(
        tap(response => {
          if (response && response.accessToken) {
            localStorage.setItem(this.tokenKey, response.accessToken);
            this.setaStatusLogin();
          }
        }),
        map(response => response.accessToken),
        catchError(err => {
          console.error('Erro no refresh:', err);
          if (err.status === 401) {
            // Backend retornou "forcarLogin" ou refresh expirado
            this.logout();
          }
          return throwError(() => err);
        })
      );
  }

  // ---------- STATUS ----------
  setaStatusLogin(): void {
    this.loggedIn.next(true);
  }

  setaStatusLogout(): void {
    this.loggedIn.next(false);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  // ---------- PAYLOAD HELPERS ----------
  private decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  getUserRole(): string | null {
    const payload = this.decodeToken();
    return payload?.tipo ?? null;
  }

  getPersonalId(): number | null {
    const payload = this.decodeToken();
    return payload?.personalid ?? null;
  }

  getAlunoId(): number | null {
    const payload = this.decodeToken();
    return payload?.alunoid ?? null;
  }

  getUserId(): number | null {
    const payload = this.decodeToken();
    return payload?.userid ?? null;
  }
}


/*
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiURL = `${environment.apiUrl}/login`; // URL do backend
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

  login(email: string, password: string): void {
    console.log('AS login');
    this.http.post<{ token: string }>(`${environment.apiUrl}/login`, { email, password })
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
    return payload.personalid ?? null;
  }

  getAlunoId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.alunoid ?? null;
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userid ?? null;
  }
}
*/