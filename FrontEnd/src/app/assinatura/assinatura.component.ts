import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider'; 
import { MatIconModule } from '@angular/material/icon'; 
import { MatTableModule } from '@angular/material/table';
import type { Assinatura } from '../models/assinatura.model';
import type { AssinaturaPagto } from '../models/assinaturaPagto.model';
import type { Plano } from '../models/plano.model';
import { AssinaturaService } from '../services/assinaturaService';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
//import { RouterModule } from '@angular/router';

import { Personal } from '../models/personal.model';
import { PersonalService } from '../services/personal.service';

@Component({
    selector: 'app-assinatura',
    imports: [CommonModule, MatCardModule, MatDividerModule, MatIconModule, MatTableModule],
    standalone: true,
    templateUrl: './assinatura.component.html',
    styleUrls: ['./assinatura.component.css'],


})
export class AssinaturaComponent implements OnInit{

    historico:any;
    pagamentos:any[]=[];
    carregando=true;
    carregandoDadosPersonal=true;
    carregandoDadosPlano=true;
    carregandoDadosPagtos=true;
    carregandoPlanos=true;
    assinatura:any; /* Assinatura[] = [];*/
    assinaturaPagto: AssinaturaPagto[] = [];
    planos: Plano[] = [];
    pix:any;
    planoSelecionado: any;
    //personal: Personal[] = [];
    personal!: Personal;

    constructor(private assinaturaService: AssinaturaService, private authService: AuthService,
                /*private cd: ChangeDetectorRef, private bottomSheet: MatBottomSheet, */
                private http: HttpClient, private snackBar: MatSnackBar, /*, private dialog: MatDialog*/
                private personalService: PersonalService, private router: Router,
    ) {}

    ngOnInit(){

        this.getDadosPersonal() ;
        this.carregaPlanos();
        this.carregaDadosPlano();
        this.carregaDadosPagtos();


    }

    private getDadosPersonal() {
      this.carregandoDadosPersonal = true;
      //console.log("carregar planos:");
    
      this.personalService.getDadosPersonal()
          .pipe(finalize(() => this.carregandoDadosPersonal = false))
        .subscribe({
          next: (resp: any) => {
            this.personal = resp; // 👈 força nova referência
    
            console.log("this.personal:", this.personal);
          },
          error: (e: any) => console.error('Erro ao carregar personal', e)
        });
    }


    selecionarPlano(plano: any) {
        this.planoSelecionado = plano;
        console.log("plano selecionado", this.planoSelecionado);
    }
    
    private carregaPlanos() {
      this.carregandoPlanos = true;
      console.log("carregar planos:");
    
      this.assinaturaService.carregaPlanos()
          .pipe(finalize(() => this.carregandoPlanos = false))
        .subscribe({
          next: (resp: any) => {
            this.planos = [...resp]; // 👈 força nova referência
    
            console.log("this.planos:", this.planos);
          },
          error: (e: any) => console.error('Erro ao carregar planos', e)
        });
    }

    private carregaDadosPlano() {
      this.carregandoDadosPlano = true;
      console.log("carregar dados plano:");
    
      this.assinaturaService.carregaDadosPlano()
          .pipe(finalize(() => this.carregandoDadosPlano = false))
        .subscribe({
          next: (resp: any) => {
            this.assinatura = resp; 
    
            console.log("this.plano:", this.assinatura);
          },
          error: (e: any) => console.error('Erro ao carregar dados do plano', e)
        });
    }

    private carregaDadosPagtos() {
      this.carregandoDadosPagtos = true;
      console.log("carregar dados pagamentos:");
    
      this.assinaturaService.carregaAssinaturaPagtos()
          .pipe(finalize(() => this.carregandoDadosPagtos = false))
        .subscribe({
          next: (resp: any) => {
            this.assinaturaPagto = [...resp]; // 👈 força nova referência
    
            console.log("this.assinaturaPagto:", this.assinaturaPagto);
          },
          error: (e: any) => console.error('Erro ao carregar dados do pagamentos', e)
        });
    }

    assinaturaCriarPgtoPix(planoId: number) {


        console.log("this.planoselecionado", this.planoSelecionado);
        console.log("planoId", planoId);
        console.log("personalxxx", this.personal);
        console.log("console.log(this.personal.cpf)", this.personal.cpf);

        const camposFaltando: string[] = [];

        if (!this.personal?.telefone) camposFaltando.push('Telefone/WhatsApp');
        if (!this.personal?.cpf) camposFaltando.push('CPF');
        if (!this.personal?.cep) camposFaltando.push('CEP');
        if (!this.personal?.logradouro) camposFaltando.push('Logradouro');
        if (!this.personal?.numero) camposFaltando.push('Número');

        if (camposFaltando.length > 0) {

            this.snackBar.open(
                `Complete seus dados castrais para ativar a assinatura. \n
                 Campos pendentes: ${camposFaltando.join(', ')}.`,
                '',
                {
                    duration: 5000,
                    panelClass: ['snackbar-warning'],
                    horizontalPosition: 'center',
                    verticalPosition: 'top'
                }
            );

            this.router.navigate(['/configuracoesConta']);
            return;
        }

        this.assinaturaService.assinaturaCriarPgtoPix(planoId).subscribe(ret => {

            console.log(ret);
            this.pix = ret;
            
        });

    }

    textoBotao = 'Copiar código PIX';

    copiarPix() {

        navigator.clipboard.writeText(this.pix.asppix_copia_cola).then(() => {

            this.textoBotao = '✔ Copiado!';

            setTimeout(() => {

                this.textoBotao = 'Copiar código PIX';

            }, 2000);

            this.snackBar.open(
                '✔ Código PIX copiado!',
                '',
                {
                    duration: 2500,
                    panelClass: ['snackbar-success'],
                    horizontalPosition: 'center',
                    verticalPosition: 'top'
                }
            );

        })
        .catch(() => {

            this.snackBar.open(
                'Não foi possível copiar o código PIX.',
                '',
                {
                    duration: 3000
                }
            );

        });            

    }

}
