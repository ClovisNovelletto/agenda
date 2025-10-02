/*import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-footer',
  imports: [MatSidenavModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

}*/


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
import { App } from '@capacitor/app';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, MatSidenavModule, MatToolbarModule, MatIconModule, MatListModule, MatButtonModule, MatMenuModule, MatTabsModule, RouterModule], // Adicione o RouterModule aqui]
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  isLoggedIn: boolean = false; // Inicialmente o usuário não está logado

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit() {
    // Subscribing ao estado de login
    console.log('top onInit Executando', this.isLoggedIn);
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status; // Atualiza automaticamente com base no estado
      console.log('top Estado atualizado:', this.isLoggedIn);
    });
  }

  isMobile(): boolean {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  logout() {
    if (this.isMobile()) {
      App.exitApp();
    } else {
      this.snackBar.open('Feche a aba manualmente para sair do sistema!\nSe quiser forçar login use a opção desconectar no menu superior', 'Fechar', { duration: 3000, panelClass: ['snackbar-preline'] });
      /*alert('Feche a aba manualmente para sair do sistema.'); */     
    }
    //manter logado e apenas fechar o app
    /*
    this.authService.logout();
    localStorage.removeItem('token'); // Remove o token
    localStorage.removeItem('jwt-token');
    this.router.navigate(['/login']); // Redireciona para o login
    this.authService.logout(); // Chama o logout do AuthService
    */
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
