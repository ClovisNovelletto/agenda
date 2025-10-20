import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { Share } from '@capacitor/share';
import { HttpClient } from '@angular/common/http';
import pdfMake from 'pdfmake/build/pdfmake';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private pastaAndroid = 'h2u'; // subpasta dentro de Download

  constructor(private http: HttpClient, private fileOpener: FileOpener) {}

  /**
   * Salva PDF em local visível (Android) ou sandbox (Web)
   */
  async salvarPDF(nomeArquivo: string, dataBase64: string): Promise<void> {
    const plataforma = Capacitor.getPlatform();

    const options =
      plataforma === 'android'
        ? {
            path: `${this.pastaAndroid}/${nomeArquivo}`,
            data: dataBase64,
            /*directory: Directory.ExternalStorage,*/
            directory: Directory.Documents,
            recursive: true
          }
        : {
            path: nomeArquivo,
            data: dataBase64,
            directory: Directory.Documents,
            recursive: true
          };

    try {
      await Filesystem.writeFile(options);
      //alert(`✅ PDF salvo em ${plataforma === 'android' ? 'Downloads/h2u' : 'Documents'}`);
      this.abrirPDF(nomeArquivo, false);
      console.log(`✅ PDF salvo em ${plataforma === 'android' ? 'Downloads/h2u' : 'Documents'}`);
    } catch (err) {
      alert(`Erro ao salvar PDF: ${err}`);
      console.error('Erro ao salvar PDF:', err);
    }
  }

  /**
   * Lista PDFs gravados
   */
  async listarPDFs(): Promise<string[]> {
    const plataforma = Capacitor.getPlatform();

    const options =
      plataforma === 'android'
        /*? { path: this.pastaAndroid, directory: Directory.ExternalStorage }*/
        ? { path: this.pastaAndroid, directory: Directory.Documents }
        : { path: '', directory: Directory.Documents };

    try {
      const result = await Filesystem.readdir(options);
      return result.files
        .filter(f => f.name.endsWith('.pdf'))
        .map(f => f.name);
    } catch (err) {
      console.error('Erro ao listar PDFs:', err);
      return [];
    }
  }

  /**
   * Abre PDF (FileOpener no Android / window.open no Web)
   * -> se falhar no Android, faz Share automático
   */
  async abrirPDF(nomeArquivo: string, download: boolean): Promise<void> {
    const plataforma = Capacitor.getPlatform();

    if (plataforma === 'android') {
      const caminho = `/storage/emulated/0/Download/${this.pastaAndroid}/${nomeArquivo}`;
      //const caminho = `/storage/emulated/0/Download/${nomeArquivo}`;
      try {
        await this.sharePDFAndroid(nomeArquivo);
        console.log('📖 PDF compartilhado');
        //console.log('📖 PDF aberto com FileOpener');
      } catch (err) {
        await this.fileOpener.open(caminho, 'application/pdf');
        console.warn('⚠️ Erro ao abrir com FileOpener, tentando Share...', err);
      }
    } else {
      try {
        const file = await Filesystem.readFile({
          path: nomeArquivo,
          directory: Directory.Documents
        });

        let blob: Blob;
        if (typeof file.data === 'string') {
          blob = this.base64ToBlob(file.data, 'application/pdf');
        } else {
          blob = file.data;
        }

        const url = URL.createObjectURL(blob);
        if (!download) {
          window.open(url, '_blank');
        } else {
          // 🔹 Cria link temporário para forçar nome do arquivo correto
          const a = document.createElement('a');
          a.href = url;
          a.download = nomeArquivo; // 👉 nome que será exibido no navegador
          a.target = '_blank';      // abre em nova aba se o navegador permitir
          a.click();

          // 🔹 Opcional: liberar o objeto da memória depois de um tempo
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        }          
      } catch (err) {
        console.error('Erro ao abrir PDF no navegador:', err);
      }
    }
  }

  /**
   * Compartilha PDF (fallback no Android)
   */

  
    async sharePDFAndroid(nomeArquivo: string) {
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

    private async sharePDFAndroidNaoFoi(caminho: string) {
    try {
alert(`caminho ${caminho}`);
      const plataforma = Capacitor.getPlatform();
    
      // pega apenas o nome do arquivo
      const nomeArquivo = caminho.split('/').pop();

      // lê o arquivo diretamente do diretório externo
      const arquivo = await Filesystem.readFile({
        path: `${this.pastaAndroid}/${nomeArquivo}`,
        directory: Directory.Documents,
        /*directory: Directory.ExternalStorage,*/
      });


      //alert(`caminho. ${caminho}`);
      //const arquivo = await Filesystem.readFile({
      //  path: `${this.pastaAndroid}/${caminho.split('/').pop()}`,
      //  directory: Directory.ExternalStorage,
      //});

alert(`arquivo. ${arquivo}`);
      await Share.share({
        title: 'Compartilhar PDF',
        text: 'Segue o PDF em anexo',
        url: `data:application/pdf;base64,${arquivo.data}`,
        dialogTitle: 'Compartilhar PDF',
      });

      console.log('📤 PDF compartilhado via base64');
    } catch (err) {
      console.error('Erro ao compartilhar PDF:', err);
      alert(`Não foi possível compartilhar o PDF. ${err}`);
    }
  }

  private async sharePDFAndroid_Old(caminho: string) {
    try {
      alert(`caminho: file://${caminho}`);
      await Share.share({
        title: 'Abrir PDF',
        text: 'Visualize o PDF salvo',
        url: `file://${caminho}`, // caminho local
        dialogTitle: 'Compartilhar PDF'
      });
      console.log('📤 PDF compartilhado via Share');
    } catch (err) {
      console.error('Erro ao compartilhar PDF:', err);
      alert(`Erro ao compartilhar PDF: ${err}`);
    }
  }

  /**
   * Conversão base64 -> Blob (para navegador)
   */
  private base64ToBlob(base64: string, type: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async getLogoBase64(): Promise<string> {
    // Pega o blob do PNG
    const blob = await this.http
      .get('assets/icons/logo.png', { responseType: 'blob' })
      .toPromise();

    if (!blob) throw new Error('Não foi possível carregar o logo');

    return await this.blobToBase64(blob);
  }

  async gerarESalvarPDF(nomePdf: string, docDef: any) {
    const pdfDocGenerator = pdfMake.createPdf(docDef);

    pdfDocGenerator.getBase64(async (base64Data) => {
      await this.salvarPDF(nomePdf, base64Data);
      console.log('PDF salvo com sucesso!');
    });
  }

  async excluirPDF(nomeArquivo: string) {
    const plataforma = Capacitor.getPlatform();

    // Confirmação simples
    const confirmar = confirm(`Deseja realmente excluir "${nomeArquivo}"?`);
    if (!confirmar) return;

    try {

      if (plataforma === 'android') {
        // --- ANDROID ---
        await Filesystem.deleteFile({
          path: `${this.pastaAndroid}/${nomeArquivo}`,
          /*directory: Directory.ExternalStorage,*/
          directory: Directory.Documents,
        });
      } else {
        // --- WINDOWS / WEB ---
        await Filesystem.deleteFile({
          path: nomeArquivo,
          directory: Directory.Documents,
        });
      }
/*
      const dir =
        plataforma === 'android'
          ? Directory.Documents
          : Directory.Documents;

      await Filesystem.deleteFile({
        path: `${this.pastaAndroid ? this.pastaAndroid + '/' : ''}${nomeArquivo}`,
        directory: dir,
      });
*/
      console.log(`🗑️ PDF "${nomeArquivo}" excluído com sucesso`);
    } catch (err) {
      console.error('Erro ao excluir PDF:', err);
      alert('Falha ao excluir o PDF.');
    }
  }
}



//file:///storage/emulated/0/Documents/Anamnese_06-10-2025_a%20teste%20plano.pdf