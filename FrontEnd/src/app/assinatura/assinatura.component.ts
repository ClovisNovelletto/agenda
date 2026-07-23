import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider'; 
import { MatIconModule } from '@angular/material/icon'; 
import { MatTableModule } from '@angular/material/table';
import type { Assinatura } from '../models/assinatura.model';
import { AssinaturaService } from '../services/assinaturaService';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    assinatura:any; /* Assinatura[] = [];*/
    pix:any;

    constructor(private assinaturaService: AssinaturaService, private authService: AuthService,
                /*private cd: ChangeDetectorRef, private bottomSheet: MatBottomSheet, */
                private http: HttpClient, private snackBar: MatSnackBar /*, private dialog: MatDialog*/
    ) {}

    ngOnInit(){

        //depois vamos buscar na API

    /*assinaturaId:number;
    valor:number;
    status:string;
    dataInicio:Date;
    dataFim:Date;
    diasRestantes:number;
    */
        this.assinatura={
            assinaturaId:1,
            valor:10,
            status:'ATIVA',
            dataInicio:new Date(2026,6,10),
            dataFim:new Date(2026,7,10),
            diasRestantes:8

        };

        this.pagamentos=[

            {

                data:'10/07/2026',

                valor:10,

                status:'PAGO',

                gateway:'Mercado Pago'

            },

            {

                data:'10/06/2026',

                valor:10,

                status:'PAGO',

                gateway:'Mercado Pago'

            }

        ];

        this.carregando=false;

    }

    assinaturaCriarPgtoPix() {

        this.assinaturaService.assinaturaCriarPgtoPix().subscribe(ret => {

            console.log(ret);
            this.pix = ret;
            
        });

        //this.assinaturaService.assinaturaCriarPgtoPix()
        //    .subscribe({
        //        next: (res)=>{

        //            console.log(res);

        //        },
        //        error:(err)=>{

        //            console.error(err);

        //        }
        //    });

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
