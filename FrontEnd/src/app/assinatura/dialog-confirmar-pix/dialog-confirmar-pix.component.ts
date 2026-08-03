import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
//import { MatDialog } from '@angular/material/dialog';
//import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon'; 

@Component({
    selector: 'app-dialog-confirmar-pix',
    templateUrl: './dialog-confirmar-pix.component.html',
    styleUrls: ['./dialog-confirmar-pix.component.css'],
    imports: [MatDialogContent, MatDialogActions, CommonModule, MatIconModule]
/*
MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatTableModule, MatProgressSpinnerModule, MatFormFieldModule, 
            MatInputModule, MatDatepickerModule, MatNativeDateModule, CommonModule, MatCheckboxModule, FormsModule,
            MatDialogContent, MatSelectModule
*/                        
})
export class ConfirmarPixDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<ConfirmarPixDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    cancelar() {
        this.dialogRef.close(false);
    }

    confirmar() {
        this.dialogRef.close(true);
    }

}