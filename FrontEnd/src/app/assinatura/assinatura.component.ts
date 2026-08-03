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

import { ConfirmarPixDialogComponent } from './dialog-confirmar-pix/dialog-confirmar-pix.component'

//import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
//import { MatDialogModule } from '@angular/material/dialog';

import dayjs from 'dayjs';

interface assDadAtual {
  aspstatus: string,
  aspdata_pagamento: Date;
}

interface Dadplanoselecionado {
    plano_id: number
    plano: string,
    valor: number,
    inicio: Date,
    validade: Date
}

@Component({
    selector: 'app-assinatura',
    imports: [CommonModule, MatCardModule, MatDividerModule, MatIconModule, MatTableModule/*, MatDialogContent, MatDialogActions*/],
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
    carregandoDadosPlanoSelecionado=true;
    carregandoDadosPagtos=true;
    carregandoPlanos=true;
    assinatura: any; // Assinatura[] = [];
    assinaturaPagto: AssinaturaPagto[] = [];
    planos: Plano[] = [];
    pix:any;
    planoSelecionado: any;/*Plano[] = [];*/
    //personal: Personal[] = [];
    personal!: Personal;
    dadplanoselecionado: any; /*Dadplanoselecionado[] = [];*/
    //private timerPagamento?: ReturnType<typeof setInterval>;
    private timerPagamento?: any;

    constructor(private assinaturaService: AssinaturaService, private authService: AuthService,
                /*private cd: ChangeDetectorRef, private bottomSheet: MatBottomSheet, */
                private http: HttpClient, private snackBar: MatSnackBar, /*, private dialog: MatDialog*/
                private personalService: PersonalService, private router: Router, private dialog: MatDialog,
    ) {}

    ngOnInit(){

        this.getDadosPersonal() ;
        this.carregaPlanos();
        this.carregaDadosPlano();
        this.carregaDadosPagtos();

//this.pix='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';
//this.iniciarVerificacaoPagamento();
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
        this.carregaDadosPlanoSelecionado();
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
        
        if (!this.validaDadosPersonal(planoId)) return;
        this.abreDialogConfirmapix(planoId);

    }

    textoBotao = 'Copiar código PIX';

        private validaDadosPersonal(planoId: number): Boolean {

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
            return false;
        }        
        return true;
    }

    private abreDialogConfirmapix(planoId: number) {
        retorno: Boolean;
        const dialogRef = this.dialog.open(ConfirmarPixDialogComponent, {

            width: '420px',
            panelClass: 'dialog-pix',
            data: {

                plano: this.planoSelecionado?.descricao,
                valor: this.planoSelecionado?.valorativo,
                inicio: this.dadplanoselecionado?.inicio,
                fim: this.dadplanoselecionado?.validade

            }

        });

        dialogRef.afterClosed().subscribe(confirmou => {

            console.log('confirmou', confirmou);

            if (!confirmou) {
                return;
            }

            this.assinaturaService.assinaturaCriarPgtoPix(planoId).subscribe(ret => {

                console.log(ret);
                this.pix = ret;
                this.iniciarVerificacaoPagamento();
            });

        });

    }

    private iniciarVerificacaoPagamento() {

        // evita criar dois timers
        if (this.timerPagamento) {
            clearInterval(this.timerPagamento);
        }

        this.timerPagamento = setInterval(() => {

            console.log('this.personal?.assinaturaid',this.personal?.assinaturaid);
            console.log('this.planoSelecionado?.plano_id',this.planoSelecionado?.plano_id);
            this.assinaturaService.buscarDadosAtualizAss(this.personal?.assinaturaid, this.planoSelecionado?.plano_id).subscribe({

                next: (assinatura) => {

                    console.log("assinatura.aspdata_pagamento", assinatura.aspdata_pagamento);
                    console.log("assinatura.aspstatus", assinatura.aspstatus);
                    console.log("assinatura", assinatura);
                    if (assinatura.aspstatus==='PAGO' && dayjs(assinatura.aspdata_pagamento).isAfter(dayjs().subtract(1, 'day'))) {

                        clearInterval(this.timerPagamento);
                        this.timerPagamento = null;

                        this.snackBar.open(
                            'Pagamento confirmado! Assinatura ativada com sucesso.',
                            '',
                            {
                                duration: 4000,
                                panelClass: ['snackbar-success'],
                                horizontalPosition: 'center',
                                verticalPosition: 'top'
                            }
                        );

                        // recarrega a tela
                        this.getDadosPersonal() ;
                        this.carregaPlanos();
                        this.carregaDadosPlano();
                        this.carregaDadosPagtos();
                        this.pix = null;

                    }

                },

                error: (err) => {
                    console.error('entrou na chamada', err);
                },

                complete: () => {
                    console.log('Consulta finalizada');
                }

            });

        }, 10000); // 10 segundos
    }
    ngOnDestroy() {

        if (this.timerPagamento) {
            clearInterval(this.timerPagamento);
        }

    }    

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
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top'
                }
            );

        });            

    }

    private carregaDadosPlanoSelecionado() {
      this.carregandoDadosPlanoSelecionado = true;
      console.log("carregar dados plano:");
    
      this.assinaturaService.buscarDadosAtualizAss(this.personal?.assinaturaid, this.planoSelecionado.plano_id)
          .pipe(finalize(() => this.carregandoDadosPlanoSelecionado = false))
        .subscribe({
          next: (resp: any) => {
            this.dadplanoselecionado = resp; 
    
            console.log("this.dadplanoselecionado:", this.dadplanoselecionado);
          },
          error: (e: any) => console.error('Erro ao carregar dados do dadplanoselecionado', e)
        });
    }    
}
