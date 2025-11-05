import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component'; // Adjust path
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { MatInputModule } from '@angular/material/input';
//import { MatSelectModule } from '@angular/material/select';
//import { MatButtonModule } from '@angular/material/button';
//import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  templateUrl: './resetar-senha.component.html',
  styleUrls: ['./resetar-senha.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, 
            MatFormFieldModule, AuthLayoutComponent, MatIconModule,
          MatInputModule/*, MatSelectModule, MatButtonModule, MatToolbarModule*/]
})
export class ResetarSenhaComponent implements OnInit {
  resetForm!: FormGroup;
  token!: string;
  mensagem = '';
  carregando = false;

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


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Captura o token da URL (?token=xyz)
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.senhasIguais });
  }

  senhasIguais(group: FormGroup) {
    const senha = group.get('password')?.value;
    const confirmar = group.get('confirmPassword')?.value;
    return senha === confirmar ? null : { senhasDiferentes: true };
  }

/*  get senhasIguais(): boolean {
    const senha = this.resetForm.get('password')?.value;
    const confirmar = this.resetForm.get('confirmPassword')?.value;
    return senha && confirmar && senha === confirmar;
  }*/

  get senhasDiferentes() {
    return this.resetForm.errors?.['senhasDiferentes'];
  }


  onSubmit() {
    if (this.resetForm.invalid || !this.token) return;
    this.carregando = true;

    const novaSenha = this.resetForm.value.password;

    this.http.post<{ mensagem: string }>(`${environment.apiUrl}/auth/resetar-senha`, {
      token: this.token,
      novaSenha: novaSenha
    }).subscribe({
      next:  (res) => {
        this.mensagem = res.mensagem ||'Senha redefinida com sucesso! Você já pode fazer login.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
        this.snackBar.open(this.mensagem, 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-success'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        console.error(err);
        this.mensagem = err.error?.mensagem || 'Erro ao redefinir senha. O link pode ter expirado.';
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