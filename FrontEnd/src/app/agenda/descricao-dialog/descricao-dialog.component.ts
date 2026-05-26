// descricao-dialog.component.ts
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-descricao-dialog',
  standalone: true,
  templateUrl: './descricao-dialog.component.html',
  styleUrls: ['./descricao-dialog.component.css'],
  imports: [MatDialogContent, MatFormFieldModule, CommonModule, FormsModule, MatInputModule, MatToolbarModule, MatIconModule],

})
export class DescricaoDialogComponent implements OnInit {
  acessoPersonal: Boolean = false; 
    
  descricao: string ="";

  constructor(
    public dialogRef: MatDialogRef<DescricaoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService,
  ) {
    this.descricao = data.descricao || '';
    console.log('data', data);
  }

  ngOnInit(): void {
    if(this.authService.getPersonalId() ?? 0 > 0){
      this.acessoPersonal = true
    }
  }

  salvar() {
    this.dialogRef.close(this.descricao);
  }

  cancelar() {
    this.dialogRef.close();
  }

  fechar() {
    this.dialogRef.close();
  }
}
