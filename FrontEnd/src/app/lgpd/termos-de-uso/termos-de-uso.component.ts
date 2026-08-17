import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Location } from '@angular/common';

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
    this.location.back();
    /*this.router.navigate(['/']);*/
  }

}