import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatDatepicker } from '@angular/material/datepicker';
import { finalize } from 'rxjs/operators';

import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // ou MatMomentDateModule
import { AuthService } from '../../auth.service';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { map } from 'rxjs/operators';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MonthPickerInlineComponent } from '../../shared/monthpickerinline/monthpickerinline.component';
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { AgendaTreinoService } from '../../services/agendaTreino.service';
import { MatTooltipModule } from '@angular/material/tooltip'; // <-- Importe aqui

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { AgendaTreino } from '../../models/agendaTreino.model';
import { AgendaTreinoItem } from '../../models/agendaTreinoItem.model';
import { MatSnackBar } from '@angular/material/snack-bar';

dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-agendaTreino',
  templateUrl: './agenda-treino.component.html',
  styleUrls: ['./agenda-treino.component.css'],
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatTableModule, MatProgressSpinnerModule, MatFormFieldModule, 
            MatInputModule, MatDatepickerModule, MatNativeDateModule, CommonModule, MatCheckboxModule, FormsModule,
            MatSelectModule, MatTooltipModule, DragDropModule, ],
  })
 
export class AgendaTreinoComponent implements OnInit {


  @ViewChild('monthPicker') monthPicker!: MatDatepicker<Date>;

  constructor(private agendaTreinoService: AgendaTreinoService, private authService: AuthService,
              private cd: ChangeDetectorRef, private bottomSheet: MatBottomSheet, 
              private http: HttpClient, private dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public  data: any,
              public dialogRef: MatDialogRef<AgendaTreinoComponent>,
              private snackBar: MatSnackBar
  ) {}

    agendaTreino!: AgendaTreino;
    concluidos = 0;
    aluno: string ="";
    mensagem: string="";

    ngOnInit() {
    
        console.log("teste", this.data);
        this.aluno = this.data.aluno;
        this.agendaTreino = this.data.agendaTreino;
        this.atualizarProgresso();
        /*
        this.agendaTreinoService.getTreino(this.data.agendaId)
        .subscribe((res: any) => {
        this.agendaTreino = res;

        if (!this.agendaTreino ||!this.agendaTreino.id) {

            //alert('Nenhum treino encontrado para esta agenda.');
            this.mensagem = 'Nenhum treino encontrado para esta agenda.';
            this.snackBar.open(this.mensagem, 'Fechar', {
            duration: 5000,
            panelClass: ['snackbar-success'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
            });

            return;
        }

        console.log("treino", this.agendaTreino);
        this.atualizarProgresso();
        });
        */
    }

    marcar(item: any, event: any) {
        const concluido = event.target.checked;
        this.agendaTreinoService.concluirItem(item.id, concluido ).subscribe(() => {
            item.concluido = concluido;
            this.atualizarProgresso();
        });
    }

    marcarTodos() {
        this.agendaTreinoService.concluirTreino(this.agendaTreino.id, true).subscribe(() => {
            this.agendaTreino.concluido = true;
            this.agendaTreino.items.forEach(i => i.concluido = true);
            this.atualizarProgresso();
        });
    }

    desmarcarTodos() {
        this.agendaTreinoService.concluirTreino(this.agendaTreino.id, false).subscribe(() => {
            this.agendaTreino.concluido = false;
            this.agendaTreino.items.forEach(i => i.concluido = false);
            this.atualizarProgresso();
        });
    }
    atualizarProgresso() {
        this.concluidos = this.agendaTreino.items
            .filter((i: any) => i.concluido).length;
        console.log("concluidos", this.concluidos);        
    }

    fechar() {
     this.dialogRef.close();
    }
}