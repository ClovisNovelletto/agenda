import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { Share } from '@capacitor/share';
import { HttpClient } from '@angular/common/http';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.vfs;

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private pastaAndroid = 'h2u'; // subpasta dentro de Download

  constructor(private http: HttpClient, private fileOpener: FileOpener) {}

  /**
   * Salva PDF em local visível (Android) ou sandbox (Web)
   */

  async salvarPDF(nomeArquivo: string, docDef: any) {
    //alert(`Iniciando salvarPDF: ${nomeArquivo}`);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    try {
      const pdfDoc = (pdfMake as any).createPdf(docDef);
      //alert('pdfDoc criado com sucesso');

      if (isMobile) {
        //alert('Vai salvar no mobile');
        pdfDoc.getBase64(async (data: string) => {
          //alert('Callback do getBase64 chamado!');
          try {
            await Filesystem.writeFile({
              path: nomeArquivo,
              data,
              directory: Directory.Data,
            });

            //alert(`Arquivo salvo: ${nomeArquivo}`);
            await this.abrirPDF(nomeArquivo, false, false);
          } catch (err) {
            alert('Erro ao salvar: ' + JSON.stringify(err));
          }
        });
      } else {
        pdfDoc.getBase64(async (data: string) => {
          //alert('Callback do getBase64 chamado!');
          try {
            await Filesystem.writeFile({
              path: nomeArquivo,
              data,
              directory: Directory.Documents,
            });

            //alert(`Arquivo salvo: ${nomeArquivo}`);
            await this.abrirPDF(nomeArquivo, false, false);
          } catch (err) {
            alert('Erro ao salvar: ' + JSON.stringify(err));
          }
        });        
        //alert('Rodando no navegador');
        this.abrirPDF(nomeArquivo, false, false);
        //pdfDoc.getBlob((blob: Blob) => {
        //  const link = document.createElement('a');
        //  link.href = URL.createObjectURL(blob);
        //  link.download = nomeArquivo;
        //  link.click();
        //});
      }
    } catch (err) {
      alert('Erro geral: ' + err);
    }
  }

  async salvarPDFversãopermissão(nomeArquivo: string, dataBase64: string): Promise<void> {
    const plataforma = Capacitor.getPlatform();

    const options =
      plataforma === 'android'
        ? {
            path: `${this.pastaAndroid}/${nomeArquivo}`,
            data: dataBase64,
            directory: Directory.ExternalStorage,
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
      this.abrirPDF(nomeArquivo, false, false);
      console.log(`✅ PDF salvo em ${plataforma === 'android' ? 'Downloads/h2u' : 'Documents'}`);
    } catch (err) {
      alert(`Erro ao salvar PDF: ${err}`);
      console.error('Erro ao salvar PDF:', err);
    }
  }

  /**
   * Lista PDFs gravados
   */
    async listarPDFsanterior(): Promise<string[]> {
    try {
      const result = await Filesystem.readdir({
        path: `${this.pastaAndroid}`,
        directory: Directory.External
        /*directory: Directory.Data*/
      });

      return result.files
        .filter(f => f.name.endsWith('.pdf'))
        .map(f => f.name);
    } catch (err) {
      console.error('Erro ao listar PDFs:', err);
      return [];
    }
  }

  async listarPDFs(): Promise<string[]> {
    const plataforma = Capacitor.getPlatform();

    const options =
      plataforma === 'android'
        /*? { path: this.pastaAndroid, directory: Directory.ExternalStorage }*/
        ? { path: this.pastaAndroid, directory: Directory.External }
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
  async abrirPDF(nomeArquivo: string, download: boolean, external: boolean): Promise<void> {
    const plataforma = Capacitor.getPlatform();

    if (plataforma === 'android') {
      /*const caminho = `/storage/emulated/0/Download/${this.pastaAndroid}/${nomeArquivo}`;*/
      const caminho = `/storage/emulated/0/Download/${nomeArquivo}`;
      try {
        if (external) {
          await this.sharePDFAndroidExternal(nomeArquivo);
        }else{
          await this.sharePDFAndroid(nomeArquivo);
        }
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
          //const blobUrl = URL.createObjectURL(blob);
          //const a = document.createElement('a');
          //a.href = blobUrl;
          //a.download = nomeArquivo; // força o nome
          //a.target = '_blank';
          //a.click();

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
      const file = await Filesystem.readFile({
        path: nomeArquivo,
        directory: Directory.Data
      });

      //alert(`file: ${file}`);
      // nome único para evitar cache do Android
      const timestamp = new Date().getTime();
      const nomeUnico = `${nomeArquivo.replace('.pdf','')}_${timestamp}.pdf`;

      //alert(`timestamp: ${timestamp}`);
      //alert(`nomeUnico: ${nomeUnico}`);

      // cria pasta pública se não existir
      try {
        await Filesystem.stat({
          path: this.pastaAndroid,
          directory: Directory.External
        });
        // pasta já existe, não precisa criar
      } catch (e) {
        // pasta não existe, cria
        try {
          await Filesystem.mkdir({
            path: this.pastaAndroid,
            directory: Directory.External,
            recursive: true
          });
        } catch (e: any) {
          if (e.code !== 'EEXIST') throw e; // ignora se já existe
        }
      }

      //alert(`mkdir passou:`);
      // salva a cópia na pasta pública
      await Filesystem.writeFile({
        /*path: `${this.pastaAndroid}/${nomeUnico}`,*/
        path: `${this.pastaAndroid}/${nomeArquivo}`,
        data: file.data,
        directory: Directory.External
      });

      //alert(`writefile passou`);
      // obtém URI pública
      const publicUri = await Filesystem.getUri({
        /*path: `${this.pastaAndroid}/${nomeUnico}`,*/
        path: `${this.pastaAndroid}/${nomeArquivo}`,
        directory: Directory.External
      });

      //alert(`publicUri: ${publicUri}`);
      await Share.share({
        title: 'Visualizar PDF',
        text: 'Abrir PDF gerado',
        url: publicUri.uri,
        dialogTitle: 'Abrir com...'
      });

    } catch (err) {
      console.error('Erro ao compartilhar PDF:', err);
      alert(`Não foi possível compartilhar o arquivo. ${err}`);
    }
  }
    async sharePDFAndroidExternal(nomeArquivo: string) {
      //alert('entrou no share.');
      try {
        const fileUri = await Filesystem.getUri({
          path: `${this.pastaAndroid}/${nomeArquivo}`,
          /*directory: Directory.Documents*/
          directory: Directory.External
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
    await this.salvarPDF(nomePdf, docDef);
    //const pdfDocGenerator = pdfMake.createPdf(docDef);

    //pdfDocGenerator.getBase64(async (base64Data) => {
    //  await this.salvarPDF(nomePdf, base64Data);
    //  console.log('PDF salvo com sucesso!');
    //});
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
          directory: Directory.External,
          /*directory: Directory.Data,*/
        });
      } else {
        // --- WINDOWS / WEB ---
        await Filesystem.deleteFile({
          path: nomeArquivo,
          directory: Directory.Documents,
          /*directory: Directory.Data,*/
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
