import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ImagemUtils } from '@shared/utils/imagem/imagem.utils';

/**
 * Pipe para sanitizar imagens base64 e URLs de imagem
 * 
 * Uso:
 * ```html
 * <img [src]="imagemBase64 | safeImage" alt="Imagem">
 * ```
 */
@Pipe({
  name: 'safeImage',
  standalone: true
})
export class SafeImagePipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined, mimeType = 'image/jpeg'): SafeUrl | null {
    if (!value) {
      return null;
    }

    // Se já tem o prefixo data:image, usa diretamente
    // Senão, adiciona o prefixo com o mimeType fornecido
    const imagemComPrefixo = ImagemUtils.adicionarPrefixo(value, mimeType);
    
    // Sanitiza a URL para uso seguro no template
    return this.sanitizer.bypassSecurityTrustUrl(imagemComPrefixo);
  }
}
