import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Location } from '@angular/common';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-termos',
  standalone: true,

  imports: [
    RouterLink,
    
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule
  ],

  templateUrl: './termos-de-uso.component.html',
  styleUrl: './termos-de-uso.component.css'
})
export class TermosDeUsoComponent {

  constructor(
    private router: Router, private location: Location,
  ) {}

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
    /*this.router.navigate(['/']);*/
  }

}