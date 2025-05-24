import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '..//auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-top',
  imports: [CommonModule, MatSidenavModule, MatToolbarModule, MatIconModule, MatListModule, MatButtonModule, MatMenuModule, MatTabsModule, RouterModule], // Adicione o RouterModule aqui]
  templateUrl: './top.component.html',
  styleUrl: './top.component.css'
})
export class TopComponent {
  isLoggedIn: boolean = false; // Inicialmente o usuário não está logado

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Subscribing ao estado de login
    console.log('top onInit Executando', this.isLoggedIn);
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status; // Atualiza automaticamente com base no estado
      console.log('top Estado atualizado:', this.isLoggedIn);
    });
  }

  logout() {
    this.authService.logout();
    localStorage.removeItem('token'); // Remove o token
    localStorage.removeItem('jwt-token');
    this.router.navigate(['/login']); // Redireciona para o login
    this.authService.logout(); // Chama o logout do AuthService
  }

  onTabChange(event: any): void {
    const tabIndex = event.index;
    if (tabIndex === 0) {
      this.router.navigate(['/agenda']);
    } else if (tabIndex === 2) {
      this.router.navigate(['/financeiro']);
    }
  }
}
