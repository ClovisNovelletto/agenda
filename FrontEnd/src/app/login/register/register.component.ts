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

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatToolbarModule], // Adicione o RouterModule aqui]
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

    isLoading = false;
    erro: string = '';

  constructor(private http: HttpClient, private router: Router, private fb: FormBuilder) {}

    ngOnInit() {
    this.formData = this.fb.group({
      tipoUsuario: ['', Validators.required],
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      usuario: ['', Validators.required],
      senha: ['', Validators.required],
      codigoConvite: [''/*, Validators.required*/]
    });
  }

  onRegister() {
    this.isLoading = true;
    this.erro = '';

    const tipoUsuario = this.formData.get('tipoUsuario')?.value;
    const url = tipoUsuario === 'personal'
      ? `${environment.apiUrl}/cadastro-personal`
      : `${environment.apiUrl}/cadastro-aluno`;

    this.http.post(url, this.formData.value).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        this.erro = err.error?.message || 'Erro ao cadastrar.';
        this.isLoading = false;
      }
    });
  }
  get tipoUsuario(): string {
    return this.formData.get('tipoUsuario')?.value;
  }  

  fechar(): void {
    this.router.navigate(['/login']); // ou a rota que quiser
  }
}
