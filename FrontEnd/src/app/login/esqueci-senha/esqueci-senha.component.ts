import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component'; // Adjust path
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  templateUrl: './esqueci-senha.component.html',
  styleUrls: ['./esqueci-senha.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, 
            MatFormFieldModule, AuthLayoutComponent]
})
export class EsqueciSenhaComponent {
  form: FormGroup;
  email: string = '';
  mensagem = '';
  carregando = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  sendReset() {
    console.log(this.form.invalid)

    if (this.form.invalid) return;
    const email = this.form.value.email;
    console.log("nem chegou")
    this.http.post<{ mensagem: string }>(`${environment.apiUrl}/auth/esqueci-senha`, {email: email}).subscribe({
      next:  (res) => {
        this.mensagem = res.mensagem || 'E-mail de redefinição enviado. Verifique sua caixa de entrada..';
        this.snackBar.open(this.mensagem, 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-success'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        console.error(err);
        this.mensagem = err.error?.mensagem || 'Erro ao enviar o link.';
        this.carregando = false;
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
