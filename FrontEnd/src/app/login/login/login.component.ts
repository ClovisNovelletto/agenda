import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '../../http.service';
import { environment } from '../../../../src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component'; // Adjust path

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [FormsModule, CommonModule, RouterModule, AuthLayoutComponent] // Adicione o FormsModule aqui
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loginFailed: boolean = false;

  constructor(private httpService: HttpService, private router: Router, private authService: AuthService, private snackBar: MatSnackBar) {}


  isLoading = false;

  onLogin(): void {
    this.httpService.post(`${environment.apiUrl}/auth/login`, {
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: (response: any) => {
        this.authService.setaStatusLogin();
        console.log('Token recebido no login:', response.token);

        localStorage.setItem('jwt-token', response.token);
        this.router.navigate(['/home']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao logar:', err);

        // Verifica se veio uma mensagem do backend (por exemplo { error: "Usuário não encontrado" })
        // tenta capturar a mensagem retornada pelo backend
        const mensagem =
          err.error?.mensagem ||    // se backend retornou { mensagem: "..." }
          err.error?.error ||      // se backend retornou { error: "..." }
          //err.mensagem ||           // se o Angular capturou o erro de rede
          'Falha no login. Verifique suas credenciais.';

        this.snackBar.open(mensagem, 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        //alert(mensagem);
      }
    });
  }

  
}

 
