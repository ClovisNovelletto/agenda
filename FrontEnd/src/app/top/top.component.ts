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
import { SobreComponent } from '../sobre/sobre.component';
import { AjudaComponent } from '../ajuda/ajuda.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-top',
  imports: [CommonModule, MatSidenavModule, MatToolbarModule, MatIconModule, MatListModule, MatButtonModule, MatMenuModule, MatTabsModule, RouterModule], // Adicione o RouterModule aqui]
  templateUrl: './top.component.html',
  styleUrl: './top.component.css'
})

export class TopComponent {
  isLoggedIn: boolean = false; // Inicialmente o usuário não está logado
  teste: string = 'testando jasdjkçlasdfjklçafds asfd adsfkjlçadfjk jaklçasdfj asdf';
  constructor(private authService: AuthService, private router: Router, private dialog: MatDialog) {}

  getTeste(): any {
    return this.teste;
  }
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
  abrirSobre() {
    this.dialog.open(SobreComponent, {
      width: '400px',
      data: {} // caso queira passar dados dinamicamente
    });
  }

  abrirAjuda() {
    this.dialog.open(AjudaComponent, {
      width: '400px',
      data: this.getTeste() // caso queira passar dados dinamicamente
    });
  }  
}
