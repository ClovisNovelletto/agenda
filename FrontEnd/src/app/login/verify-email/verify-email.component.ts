import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../src/environments/environment';
import { HttpService } from '../../http.service';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component'; // Adjust path

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css'],
  imports: [CommonModule, MatIconModule, AuthLayoutComponent] // Adicione o FormsModule aqui
})
export class VerifyEmailComponent implements OnInit {
  mensagem = 'Verificando seu e-mail...';
  success = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    private snackBar: MatSnackBar,
    public router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.mensagem = 'Token não encontrado na URL.';
      return;
    }

    //this.http.get<any[]>(`${environment.apiUrl}/aluno/alunos`
    this.http.get<{ mensagem: string }>(`${environment.apiUrl}/auth/verify-email?token=${token}`).subscribe({
      next: (res) => {
        this.mensagem = res.mensagem || 'E-mail verificado com sucesso!';
        this.success = true;
        this.snackBar.open(this.mensagem, 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-success'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        this.mensagem = err.error?.mensagem || 'Erro ao verificar e-mail.';
        this.success = false;
        this.snackBar.open(this.mensagem, 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }
}