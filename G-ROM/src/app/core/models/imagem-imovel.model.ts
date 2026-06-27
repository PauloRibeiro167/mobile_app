/**
 * Interface para imagens retornadas pela API
 */
export interface ImagemImovel {
  id?: number;
  tipo: 'fachada' | 'interna' | 'documento' | 'outros';
  descricao?: string;
  base64: string; // Imagem em formato Base64 (com ou sem prefixo data:image/...)
  mime_type?: string; // Ex: 'image/jpeg', 'image/png'
  data_upload?: string;
  tamanho_bytes?: number;
}

/**
 * Interface estendida de InscricaoData com suporte a imagens
 */
export interface InscricaoDataComImagens {
  // Adicionar ao InscricaoData existente
  imagens?: ImagemImovel[];
  imagem_fachada?: string; // Imagem principal em Base64
}

/**
 * Tipo auxiliar para trabalhar com URLs sanitizadas
 */
export interface ImagemProcessada {
  original: ImagemImovel;
  url: string; // URL sanitizada para usar no template
  thumbnail?: string; // Miniatura se necessário
}
