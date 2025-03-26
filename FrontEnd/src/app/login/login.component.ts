import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '../http.service';


@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule] // Adicione o FormsModule aqui

})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loginFailed: boolean = false;

  constructor(private httpService: HttpService, private router: Router) {}

  isLoading = false;

  onLogin(): void {
    this.httpService.post('http://localhost:3000/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response: any) => {
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
  /*
  onLogin(): void {
    this.httpService.post('http://localhost:3000/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        console.log('Token recebido no login:', response.token);
        console.log(localStorage.getItem('jwt-token'));
        console.log('Token recebido:', response.token);
        localStorage.setItem('jwt-token', response.token); // Armazena o token JWT
        console.log('Navegando para /home...');
        this.router.navigate(['/home']); // Redireciona para a página Home
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao logar:', err); // Log detalhado do erro
        alert('Falha no login. Verifique suas credenciais.'); // Feedback ao usuário
      }
    });
  }
*/    
}

 
