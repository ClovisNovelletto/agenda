import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthService } from './auth.service';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { TopComponent } from './top/top.component';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [RouterModule, FooterComponent, TopComponent, MatSidenavModule] // Adicione o RouterModule aqui
})
export class AppComponent {
  title = 'h2u Agenda';
  isLoggedIn: boolean = false; // Inicialmente o usuário não está logado

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Subscribing ao estado de login
    console.log('app onInit Executando', this.isLoggedIn);
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status; // Atualiza automaticamente com base no estado
      console.log('app Estado atualizado:', this.isLoggedIn);
    });
    Filesystem.requestPermissions();
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
