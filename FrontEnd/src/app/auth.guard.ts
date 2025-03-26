/*import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = this.authService.getToken();
    if (token) {
      return true; // Permite o acesso à rota
    } else {
      this.router.navigate(['/login']); // Redireciona para o login
      return false; // Bloqueia o acesso
    }
  }
}
*/


import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service'; // Serviço de autenticação
import jwt_decode  from 'jwt-decode';
//import { default as jwt_decode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('jwt-token');
    if (token) {
      try {
        // Decodifica o token para verificar a expiração
        //const decodedToken: any = jwt_decode(token);
        const decodedToken = (jwt_decode as any)(token);
        console.log('Token decodificado:', decodedToken);
        const currentTime = Math.floor(Date.now() / 1000); // Tempo atual em segundos
  
        if (decodedToken.exp > currentTime) {
          console.log('Acesso permitido: token válido e não expirado.');
          return true; // Token válido
        } else {
          console.log('Acesso negado: token expirado.');
          this.router.navigate(['/login']);
          return false; // Token expirado
        }
      } catch (error) {
        console.error('Erro ao decodificar o token:', error);
        this.router.navigate(['/login']);
        return false; // Token inválido
      }
    } else {
      console.log('Acesso negado: token não encontrado.');
      this.router.navigate(['/login']);
      return false; // Sem token
    }
  }
  
  
  /*
  canActivate(): boolean {
    const token = localStorage.getItem('jwt-token'); // Recupera o token diretamente
    console.log('vai verificar isLogin Token no guard:', localStorage.getItem('jwt-token'));
    console.log('isLoggedIn:', this.authService.isLoggedIn());   
      if (this.authService.isLoggedIn()) {
        console.log('Token no guard:', localStorage.getItem('jwt-token'));
        console.log('isLoggedIn:', this.authService.isLoggedIn());        
      console.log('Token válido encontrado:', token);
      return true; // Permite o acesso à rota
    } else {
      this.router.navigate(['/login']); // Redireciona para a tela de login
      return false; // Bloqueia o acesso
    }
  }*/
}