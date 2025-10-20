import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
/*import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';*/
import pdfMake from 'pdfmake/build/pdfmake';
import { HttpClient } from '@angular/common/http';

/*import { Browser } from '@capacitor/browser';*/

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor(private http: HttpClient /*private fileOpener: FileOpener*/) {}

  /**
   * Gera e salva um PDF usando pdfMake
   */
  async gerarPDF(
    nomeArquivo: string,
    docDef: any,
    abrirAposGerar: boolean = true,
    compartilhar: boolean = false
  ) {
    const pdfDoc = (pdfMake as any).createPdf(docDef);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      pdfDoc.getBase64(async (data: string) => {
        try {
          // 📂 Salva o arquivo no diretório Documents (acessível externamente)
          await Filesystem.writeFile({
            path: nomeArquivo,
            data,
            directory: Directory.Documents
          });

          const fileUri = await Filesystem.getUri({
            path: nomeArquivo,
            directory: Directory.Documents
          });

          //alert(`✅ PDF salvo como ${nomeArquivo}`);

          if (abrirAposGerar) {
            //await this.abrirPDF(fileUri.uri);
            await this.abrirPDF(nomeArquivo);
          }

          if (compartilhar) {
            await this.compartilharPDF(fileUri.uri);
          }
        } catch (err) {
          console.error('Erro ao gerar ou abrir PDF:', err);
          alert('❌ Falha ao gerar ou abrir o PDF.');
        }
      });
    } else {
      // 💻 navegador (web)
      pdfDoc.getBlob((blob: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nomeArquivo;
        link.click();
      });
    }
  }

  /**
   * Abre um PDF salvo (no visualizador padrão)
   */

  async abrirPDF(nomeArquivo: string) {
    try {
      const fileUri = await Filesystem.getUri({
        path: nomeArquivo,
        directory: Directory.Documents
      });

      console.log('URI obtida:', fileUri.uri);

      await Share.share({
        title: 'Visualizar PDF',
        text: 'Abrir PDF gerado',
        url: fileUri.uri,
        dialogTitle: 'Abrir com...',
      });
    } catch (err) {
      console.error('Erro ao abrir PDF:', err);
      alert('Não foi possível abrir o arquivo.');
    }
  }

  async abrirPDFxxx(nomeArquivo: string) {
    try {
      const fileUri = await Filesystem.getUri({
        path: nomeArquivo,
        directory: Directory.Documents
      });

      console.log('URI obtida:', fileUri.uri);
alert(`nomeArquivo: ${nomeArquivo}`);
alert(`file: ${fileUri.uri}`);
      await Share.share({
        title: 'Abrir PDF',
        url: fileUri.uri, // 👈 usa URI nativa
        dialogTitle: 'Abrir com...',
      });
    } catch (err) {
      alert(`Erro ao abrir PDF: ${err}`);
      console.error('Erro ao abrir PDF:', err);
    }
  }


  /**
   * Compartilha um PDF via apps externos (WhatsApp, Gmail, Drive, etc.)
   */
  async compartilharPDF(uri: string) {
    try {
      alert(`vai compartilhar - uri: ${uri}`);
      await Share.share({
        title: 'PDF gerado',
        text: 'Segue o PDF gerado pelo app.',
        url: uri,
        dialogTitle: 'Compartilhar PDF'
      });
    } catch (err) {
      console.error('Erro ao compartilhar PDF:', err);
      alert('❌ Falha ao compartilhar PDF.');
      alert(`excluir - Share.share: ${err}`);
      alert(`excluir - uri: ${uri}`);
    }
  }

  async arquivoExiste(nomeArquivo: string) {
    try {
      await Filesystem.stat({
        path: nomeArquivo,
        directory: Directory.Documents,
      });
      return true; // arquivo existe
    } catch (err) {
      return false; // arquivo não existe
    }
  }

  async getLogoBase64(): Promise<string> {
    // Pega o blob do PNG
    const blob = await this.http
      .get('assets/icons/logo.png', { responseType: 'blob' })
      .toPromise();

    if (!blob) throw new Error('Não foi possível carregar o logo');

    return await this.blobToBase64(blob);
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Lista todos os PDFs já salvos em Documents
   */
  async listarPDFs(): Promise<string[]> {
    try {
      const result = await Filesystem.readdir({
        path: '', // ou '/', dependendo da versão
        directory: Directory.Documents
      });

      return result.files
        .filter(f => f.name.endsWith('.pdf'))
        .map(f => f.name);
    } catch (err) {
      console.error('Erro ao listar PDFs:', err);
      return [];
    }
  }

  async lerPDF(nome: string) {
    return await Filesystem.readFile({
      path: nome,
      directory: Directory.Documents
    });
  }

}


//file:///storage/emulated/0/Documents/Anamnese_06-10-2025_a%20teste%20plano.pdf