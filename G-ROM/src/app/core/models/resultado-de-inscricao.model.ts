export interface InscricaoResponse {
  status: boolean;
  data: InscricaoData[];
  errors: any[];
}

export interface InscricaoData {
  inscricao_digito: string;
  identificacao: {
    inscricao: string;
    digito: string;
    cartografia: string;
    inscricao_anterior: string;
    data_implantacao: string;
    data_ultima_alteracao: string;
    valor_venal: number | null;
  };
  proprietario: {
    nome_proprietario: string;
  };
  endereco: {
    endereco_imovel: {
      endereco_completo: string;
      endereco_numero: number;
      endereco_complemento: string;
      cep: string;
      bairro: string;
      regional: string;
      foto: string;
    };
    endereco_correspondencia: {
      endereco_completo: string;
    };
  };
  localizacao: {
    latitude: string;
    longitude: string;
  };
  dados_lote: {
    cartografia: string;
    endereco_completo: string;
    endereco_numero: string;
    endereco_complemento: string;
    area_terreno: number;
    area_total_edificada: number;
    area_de_fato: number;
    tipo_ocupacao: string;
    tipo_ocupacao_lote: string;
    situacao_lote: string;
    topografia: string;
    pedologia: string;
  };
  dados_autonoma: {
    matricula: string;
    cartorio_matricula: string;
    area_em_construcao: number;
    area_piscina: number;
    area_edificada: number;
    tipo_dominio: string;
    tipo_imovel: string;
    tipo_posicao_fiscal: string;
    tipo_situacao: string;
  };
  dados_edificacao: {
    caracteristicas_gerais: {
      pavimentos_localizacao: number;
      pavimentos_unidade: number;
      pavimentos_total: number;
      data_construcao: string;
      andar: string;
      possui_elevador: string;
      area_privativa: string;
      area_comum: string;
      area_inferior: string;
      vagas_garagem: number;
      numero_suites: number;
      numero_dormitorios: number;
      numero_banheiros: number;
      padrao_construtivo: string;
      fator_edificacacao: number;
    };
  };
  habitese: {
    numero_habitese: string;
    data_habitese: string;
  };
  outras_caracteristicas: {
    tipologia: string;
    subtipologia: string;
    uso_especifico: string;
    responsavel_uso: string;
    regime_utilizacao: string;
    estrutura: string;
    cobertura: string;
    esquadria: string;
    vidro: string;
    conservacao: string;
    situacao_logradouro: string;
    situacao_relativa_lote: string;
    piso: string;
    forro: string;
    acabamento_interno: string;
    acabamento_externo: string;
    instalacao_eletrica: string;
    instalacao_sanitaria: string;
  };
  // Imagens do imóvel (opcional)
  imagem_fachada?: string; // Imagem principal da fachada em Base64
  imagens?: ImagemImovel[]; // Array de imagens adicionais
}

export interface ErrorData {
  code: string;
  type: string;
  message: string;
}

// Import do modelo de imagens
import { ImagemImovel } from './imagem-imovel.model';