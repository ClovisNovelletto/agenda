import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-privacidade',
  standalone: true,
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './politica-privacidade.component.html',
  styleUrl: './politica-privacidade.component.css'
})
export class PoliticaPrivacidadeComponent {

  //isMobile: boolean = false;
  constructor(private router: Router, private location: Location,) {}    
  //ngOnInit(): void {
  //  this.isMobile = window.innerWidth <= 1028; // ajustável conforme seu layout
  //    window.addEventListener('resize', () => {
  //      this.isMobile = window.innerWidth <= 1028;
  //      this.isMobile = window.innerWidth <= 1028;
  //  });
  //}

  voltar(): void {
    if (Capacitor.isNativePlatform()) {
      this.location.back();
    } else if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
      //this.router.navigate(['/']);
    }
  }

  voltar_EXCLUIR(): void {
    this.location.back();
    //this.router.navigate(['/']);
  }
}