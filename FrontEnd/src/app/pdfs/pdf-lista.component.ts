import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfService } from '../services/pdf.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pdf-lista',
  templateUrl: './pdf-lista.component.html',
  styleUrls: ['./pdf-lista.component.css'],
  imports: [CommonModule, MatIconModule]
})
export class PdfListaComponent implements OnInit {
  pdfs: string[] = [];
  carregando = false;

  constructor(private pdfService: PdfService) {}

  async ngOnInit() {
    await this.carregarPDFs();
  }

  async carregarPDFs() {
    this.carregando = true;
    try {
      this.pdfs = await this.pdfService.listarPDFs();
    } catch (err) {
      console.error('Erro ao carregar lista de PDFs:', err);
    } finally {
      this.carregando = false;
    }
  }

  async abrirPDF(nome: string) {
    try {
        await this.pdfService.abrirPDF(nome, false);
    } catch (err) {
        console.error('Erro ao abrir PDF:', err);
    }
  }

  async baixarPDF(nome: string) {
    try {
        await this.pdfService.abrirPDF(nome, true);
    } catch (err) {
        console.error('Erro ao download PDF:', err);
    }
  }

  async excluirPDF(nome: string) {
    try {
        await this.pdfService.excluirPDF(nome);
        // Atualiza lista local
      this.carregarPDFs();  
      //this.pdfs = this.pdfs.filter(p => p.name !== nome);        
    } catch (err) {
        console.error('Erro ao download PDF:', err);
    }
  }



/*
  async abrirPDF(nome: string) {
    try {
        const file = await this.pdfService.lerPDF(nome);

        if (!file) return;

        let blob: Blob;

        if (typeof file.data === 'string') {
        // se veio em base64
        blob = this.base64ToBlob(file.data, 'application/pdf');
        } else {
        // se já veio como Blob
        blob = file.data;
        }

        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (err) {
        console.error('Erro ao abrir PDF:', err);
    }
  }

  // Converte base64 para Blob (útil no navegador)
  base64ToBlob(base64: string, type: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  }
*/
}
