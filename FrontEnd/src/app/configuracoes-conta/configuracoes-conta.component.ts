import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangeDetectorRef } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

//import { map } from 'rxjs/operators';
//import { FormArray, FormControl } from '@angular/forms';

import { Personal } from '../models/personal.model';
import { PersonalService } from '../services/personal.service';

@Component({
  selector: 'app-configuracoes-conta',
  standalone: true, 
    imports: [ MatToolbarModule, MatIconModule, MatFormField, MatFormFieldModule, ReactiveFormsModule, CommonModule, MatInputModule, MatButtonModule], // Adicione o RouterModule aqui]
/*
  imports: [MatInputModule, MatNativeDateModule, MatSlideToggleModule, CommonModule, MatCheckboxModule,
            ReactiveFormsModule, MatFormFieldModule, MatInputModule,  MatSlideToggleModule, MatOptionModule, MatSelectModule,
            MatButtonModule, MatDialogModule, MatIconModule, MatToolbarModule, MatDatepickerModule, MatFormField, MatAutocompleteModule], // Adicione o RouterModule aqui]
*/                        
  templateUrl: './configuracoes-conta.component.html',
  styleUrl: './configuracoes-conta.component.css'
})
export class ConfiguracoesContaComponent {
  form!: FormGroup;
  personal: Personal | null = null;

  mensagem: string ='';


  constructor(
    private fb: FormBuilder,
    private personalService: PersonalService, private snackBar: MatSnackBar,
    private http: HttpClient, private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    
    console.log('personal', this.personal);
    this.form = this.fb.group({
      nome: ['', Validators.required],
      telefone: ['', Validators.required],
      email: ['', Validators.required],
      cpf: ['', Validators.required],
      cep: [null, Validators.required],
      logradouro: [null, Validators.required],
      numero: [null,Validators.required],
      complemento: [null],
      cidade: [null],
      uf: [null, ],

    });
  
    
    forkJoin({
      personal: this.getDadosPersonal(),
    }).subscribe(({ personal }) => {
      this.personal = personal;
      
      if (this.personal?.id) {


        // Preenche IDs no form principal
        this.form.patchValue({
          nome: this.personal.nome,
          telefone: this.personal.telefone,
          email: this.personal.email,
          cpf: this.personal.cpf,
          cep: this.personal.cep,
          logradouro: this.personal.cep,
          numero: this.personal.numero,
          complemento: this.personal.complemento,
          cidade: this.personal.cidade,
          uf: this.personal.uf,
        });

      }

      // --- Marcar campos como dirty para habilitar botão salvar ---
      this.form.markAllAsTouched();
      //this.form.markAsDirty();

      // --- Gatilho de detecção de mudança ---
      setTimeout(() => this.cd.markForCheck());
    });
  }

  getDadosPersonal(): Observable<Personal> {
    return this.personalService.getDadosPersonal();
  }

  
  salvar() {
    if (this.form.valid) {
      const formValue = this.form.value;

      const updated: any = {
        id: this.personal?.id ?? null,
        nome: formValue.nome,
        telefone: formValue.telefone,
        email: formValue.email,
        cpf: formValue.cpf,
        cep: formValue.cep,
        logradouro: formValue.logradouro,
        numero: formValue.numero,
        complemento: formValue.complemento,
        cidade: formValue.cidade,
        uf: formValue.uf,
      };

      console.log('updated:', updated);


      this.personalService.salvarDadosPersonal(updated).subscribe({
        next: () => {
          this.mensagem = '✅ Dados salvos com sucesso!';
          this.snackBar.open(this.mensagem, 'Fechar', {
            duration: 5000,
            panelClass: ['snackbar-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.form.markAsPristine();
        },
        error: () => {
          this.mensagem = '❌ Erro ao salvar dados.';
          this.snackBar.open(this.mensagem, 'Fechar', {
            duration: 5000,
            panelClass: ['snackbar-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });

    }
  }
  
  fechar() {
    //this.close();
    window.history.back();
  }
}
