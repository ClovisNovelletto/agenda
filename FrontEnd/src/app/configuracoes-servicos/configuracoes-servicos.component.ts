
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';


/*import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
*/

@Component({
  selector: 'configuracoes-servicos',
  styleUrls: ['./configuracoes-servicos.component.css'],
  templateUrl: './configuracoes-servicos.component.html',
  imports: [MatCardModule, MatListModule, FormsModule, CommonModule, MatToolbarModule, MatIconModule], // ✅ ajustado
})
export class ConfiguracoesServicosComponent implements OnInit {
  servicos: any[] = [];
  servicosSelecionados: number[] = [];

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private router: Router) {}

  ngOnInit(): void {
    this.carregarServicos();
  }

  carregarServicos() {

    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
//    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);

    // Carrega lista de todos os serviços
    this.http.get<any[]>(`${environment.apiUrl}/configuracoesServicos`, { headers })
      .subscribe(data => {
        this.servicos = data;

        // Carrega serviços que o personal já atende
        this.http.get<number[]>(`${environment.apiUrl}/personals/me/configuracoesServicos`, { headers })
          .subscribe(ids => {
            this.servicosSelecionados = ids;
          });
      });
  }

  salvarServicos() {
    const token = localStorage.getItem('jwt-token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
//    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);

    this.http.post(`${environment.apiUrl}/personals/me/configuracoesServicos`, this.servicosSelecionados, { headers })
      .subscribe(() => {
        //this.snackBar.open('Serviços atualizados com sucesso!', 'Fechar', { duration: 3000 });
        //alert('Serviços atualizados com sucesso!');
      });
    setTimeout(() => {
      this.fechar();
    }, 500);

  }
  
  fechar(): void {
    this.router.navigate(['/home']); // ou a rota que quiser
  }
}
