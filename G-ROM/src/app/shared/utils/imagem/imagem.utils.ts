import { inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

/**
 * Utilitários para trabalhar com imagens Base64
 */
export class ImagemUtils {
  /**
   * Verifica se a string Base64 tem o prefixo data URI
   */
  static temPrefixoDataUri(base64: string): boolean {
    return base64.startsWith('data:image/');
  }

  /**
   * Adiciona o prefixo data URI se não existir
   * @param base64 String Base64 com ou sem prefixo
   * @param mimeType Tipo MIME (padrão: image/jpeg)
   */
  static adicionarPrefixo(base64: string, mimeType = 'image/jpeg'): string {
    if (this.temPrefixoDataUri(base64)) {
      return base64;
    }
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Remove o prefixo data URI da string Base64
   */
  static removerPrefixo(base64: string): string {
    if (!this.temPrefixoDataUri(base64)) {
      return base64;
    }
    return base64.split(';base64,')[1] || base64;
  }

  /**
   * Extrai o MIME type do prefixo data URI
   */
  static extrairMimeType(base64: string): string | null {
    if (!this.temPrefixoDataUri(base64)) {
      return null;
    }
    const match = base64.match(/^data:([^;]+);base64,/);
    return match ? match[1] : null;
  }

  /**
   * Converte Base64 para Blob
   */
  static base64ParaBlob(base64: string): Blob | null {
    try {
      const parts = base64.split(';base64,');
      if (parts.length !== 2) {
        return null;
      }

      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uint8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; i++) {
        uint8Array[i] = raw.charCodeAt(i);
      }

      return new Blob([uint8Array], { type: contentType });
    } catch (error) {
      console.error('Erro ao converter Base64 para Blob:', error);
      return null;
    }
  }

  /**
   * Comprime uma imagem Base64 redimensionando
   * @param base64 Imagem em Base64
   * @param maxWidth Largura máxima (padrão: 800px)
   * @param quality Qualidade JPEG 0-1 (padrão: 0.85)
   */
  static async comprimirImagem(
    base64: string,
    maxWidth = 800,
    quality = 0.85
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ratio = maxWidth / img.width;
          
          canvas.width = ratio < 1 ? maxWidth : img.width;
          canvas.height = ratio < 1 ? img.height * ratio : img.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Não foi possível obter contexto do canvas'));
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };

      img.src = this.adicionarPrefixo(base64);
    });
  }

  /**
   * Calcula o tamanho aproximado em bytes de uma string Base64
   */
  static calcularTamanhoBytes(base64: string): number {
    const base64Limpo = this.removerPrefixo(base64);
    const padding = (base64Limpo.match(/=/g) || []).length;
    return Math.floor((base64Limpo.length * 3) / 4) - padding;
  }

  /**
   * Formata o tamanho em bytes para leitura humana
   */
  static formatarTamanho(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

/**
 * Service injetável para sanitização de imagens
 * Usar em componentes: private imagemService = inject(ImagemSanitizerService)
 */
export class ImagemSanitizerService {
  private sanitizer = inject(DomSanitizer);

  /**
   * Sanitiza uma imagem Base64 para uso seguro no template
   */
  sanitizarImagem(base64: string, mimeType?: string): SafeUrl {
    const imagemComPrefixo = ImagemUtils.adicionarPrefixo(base64, mimeType);
    return this.sanitizer.bypassSecurityTrustUrl(imagemComPrefixo);
  }

  /**
   * Cria uma URL temporária a partir de Base64
   * IMPORTANTE: Lembrar de revogar com URL.revokeObjectURL() depois
   */
  criarUrlTemporaria(base64: string): string | null {
    const blob = ImagemUtils.base64ParaBlob(
      ImagemUtils.adicionarPrefixo(base64)
    );
    return blob ? URL.createObjectURL(blob) : null;
  }
}
