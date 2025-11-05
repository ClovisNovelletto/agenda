import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component'; // Adjust path
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, 
            MatButtonModule, MatIconModule, MatToolbarModule, AuthLayoutComponent, RouterModule], // Adicione o RouterModule aqui]
})
export class RegisterComponent implements OnInit {
  formData!: FormGroup;

    /*userType: string = '';
    formData: any = {
      nome: '',
      email: '',
      username: '',
      password: '',
      codigoConvite: ''
    };*/
    mensagem = '';
    carregando = false;

    isLoading = false;
    erro: string = '';
    hidePassword = true;
    passwordStrength = 0;
    passwordLabel = '';
    passwordColor = 'transparent';
    canSave = false;
    passwordRequirements = {
      length: false,
      uppercase: false,
      number: false,
      special: false
    };

  constructor(private http: HttpClient, private router: Router, private fb: FormBuilder, private snackBar: MatSnackBar) {}

    ngOnInit() {
    this.formData = this.fb.group({
      tipoUsuario: ['', Validators.required],
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      /*usuario: ['', Validators.required],*/
      senha: ['', Validators.required],
      codigoConvite: [''/*, Validators.required*/]
    });
  }

  onRegister() {
    this.isLoading = true;
    this.erro = '';

    const tipoUsuario = this.formData.get('tipoUsuario')?.value;
    const url = tipoUsuario === 'personal'
      ? `${environment.apiUrl}/auth/cadastro-personal`
      : `${environment.apiUrl}/auth/cadastro-aluno`;

    this.http.post<{ mensagem: string }>(url, this.formData.value).subscribe({
      next: (res) => {
        this.mensagem = res.mensagem ||'Conta cadastrada com sucesso! Você já pode fazer login.';
        this.snackBar.open(this.mensagem, 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-success'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        this.erro = err.error?.mensagem || 'Erro ao cadastrar.';
        this.isLoading = false;

        const mensagem =
          err.error?.mensagem ||    // se backend retornou { mensagem: "..." }
          err.error?.error ||      // se backend retornou { error: "..." }
          err.mensagem ||           // se o Angular capturou o erro de rede
          'Falha no cadastro da conta.';

        this.snackBar.open(mensagem, 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-error'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });

      }
    });
  }
  get tipoUsuario(): string {
    return this.formData.get('tipoUsuario')?.value;
  }  

  fechar(): void {
    this.router.navigate(['/login']); // ou a rota que quiser
  }

  checkPasswordStrength(password: string) {
    this.passwordRequirements.length = password.length >= 8;
    this.passwordRequirements.uppercase = /[A-Z]/.test(password);
    this.passwordRequirements.number = /[0-9]/.test(password);
    this.passwordRequirements.special = /[^A-Za-z0-9]/.test(password);

    let strength = Object.values(this.passwordRequirements).filter(v => v).length;

    switch (strength) {
      case 0:
      case 1:
        this.passwordStrength = 25;
        this.passwordLabel = 'Fraca';
        this.passwordColor = '#e74c3c';
        this.canSave = false;
        break;
      case 2:
        this.passwordStrength = 50;
        this.passwordLabel = 'Média';
        this.passwordColor = '#f1c40f';
        this.canSave = false;
        break;
      case 3:
        this.passwordStrength = 75;
        this.passwordLabel = 'Boa';
        this.passwordColor = '#27ae60';
        this.canSave = true;
        break;
      case 4:
        this.passwordStrength = 100;
        this.passwordLabel = 'Forte';
        this.passwordColor = '#2ecc71';
        this.canSave = true;
        break;
    }
  }
}
