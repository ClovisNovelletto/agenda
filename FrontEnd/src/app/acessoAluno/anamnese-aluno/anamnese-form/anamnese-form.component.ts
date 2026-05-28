import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MatDatepickerModule } from '@angular/material/datepicker';

import { MatOptionModule } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormArray, FormControl } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { startWith } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-anamnese-form',
  imports: [MatInputModule, MatNativeDateModule, MatSlideToggleModule, CommonModule, MatCheckboxModule,
            ReactiveFormsModule, MatFormFieldModule, MatInputModule,  MatSlideToggleModule, MatOptionModule, MatSelectModule, MatCardModule,
            MatButtonModule, MatDialogModule, MatIconModule, MatToolbarModule, MatDatepickerModule, MatFormField, MatAutocompleteModule], // Adicione o RouterModule aqui]
  templateUrl: './anamnese-form.component.html',
  styleUrls: ['./anamnese-form.component.css'],
})
export class AnamneseFormComponent implements OnInit {
  form!: FormGroup;

  idades = Array.from({ length: 83 }, (_, i) => i + 18); // 18 a 100 anos
  pesos = Array.from({ length: 162 }, (_, i) => (40 + i * 0.5).toFixed(2)); // 40 a 120 kg
  alturas = Array.from({ length: 51 }, (_, i) => (1.40 + i * 0.01).toFixed(2)); // 1.40 a 1.90 m
  kilos = Array.from({ length: 81 }, (_, i) => 40 + i); // 40 a 120 kg
  gramas = Array.from({ length: 20 }, (_, i) => (i * 50)); // 0.00 a 0.95 de 0.05 em 0.05
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AnamneseFormComponent>,
    private http: HttpClient, private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public  data: any 
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      dataAnamnese: [new Date(), Validators.required],
      titulo: ['', Validators.required],
      peso: [null],
      pesoKg: [null],
      pesoG: [null],
      altura: [null],
      idade: [null],
      objetivo: [null],
      principalRecl: [null],
      alimentacao: [null],
      historicosaude: [null],
      fatoresrisco: [null],
      medicamentos: [null],
      sono: [null],
      descricao: [null],
    });

    if (this.data?.anamnese) {

      // Separa parte inteira e decimal
      const pesoTotal = this.data.anamnese.peso;
      const pesoKg = Math.floor(pesoTotal);
      const pesoG = +(pesoTotal - pesoKg).toFixed(2)*1000; // mantém 2 casas decimais
      this.form.patchValue({
        dataAnamnese: this.data.anamnese.data,
        titulo: this.data.anamnese.titulo,
        pesoKg: pesoKg,
        pesoG: pesoG,
        altura: this.data.anamnese.altura,
        idade: this.data.anamnese.idade,
        objetivo: this.data.anamnese.objetivo,
        principalRecl: this.data.anamnese.principalrecl,
        alimentacao: this.data.anamnese.alimentacao,
        historicosaude: this.data.anamnese.historicosaude,
        fatoresrisco: this.data.anamnese.fatoresrisco,
        medicamentos: this.data.anamnese.medicamentos,
        sono: this.data.anamnese.sono,
        descricao: this.data.anamnese.descricao,
        alunoid: this.data.anamnese.alunoid,
        id: this.data.anamnese.id
        /*servicoid: servicoSelecionado?.id*/
      });
      //this.form.disable();
    }  

    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });


  }

  
  fechar() {
    this.dialogRef.close();
  }


  getPesoTotal() {
    const kg = this.form.value.pesoKg || 0;
    const g = this.form.value.pesoG || 0;
    return kg + g/1000;
  }
}
