import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-ajuda',
  imports: [MatDialogContent, MatDialogActions],
  templateUrl: './ajuda.component.html',
  styleUrls: ['./ajuda.component.css']
})
export class AjudaComponent {

  manualUrl: any;

  constructor(
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<AjudaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  
  ngOnInit() {
    const url = 'https://app.h2uagenda.com.br/assets/manual/H2uAgenda-Manual.pdf';

    this.manualUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://docs.google.com/gview?embedded=true&url=' + url
    );
  }

  fechar() {
    this.dialogRef.close();
  }
}
