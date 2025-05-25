import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '../http.service';
import { environment } from '../../../src/environments/environment';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [FormsModule, CommonModule] // Adicione o FormsModule aqui
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loginFailed: boolean = false;

  constructor(private httpService: HttpService, private router: Router, private authService: AuthService) {}


  isLoading = false;

  onLogin(): void {
    this.httpService.post(`${environment.apiUrl}/login`, {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        this.authService.setaStatusLogin(); // Atualiza o estado no AuthService
        console.log('Token recebido no login:', response.token);
        localStorage.setItem('jwt-token', response.token); // Armazena o token JWT
        this.router.navigate(['/home']); // Redireciona para a Home
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao logar:', err);
        alert('Falha no login. Verifique suas credenciais.');
      }
    });
  }
  
}

 
