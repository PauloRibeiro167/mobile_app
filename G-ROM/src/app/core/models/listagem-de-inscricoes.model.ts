export interface InscricaoResponseCpfCnpj {
  status: string;
  data: InscricaoDataCpfCnpj[];
  errors: ErrorDataCpfCnpj[];
}

export interface InscricaoDataCpfCnpj {
  inscricao_digito: string;
  identificacao: {
    inscricao: string;
    digito: string;
    cartografia: string;
  };
  endereco: {
    endereco_completo: string;
    endereco_numero: number;
    endereco_complemento: string;
    cep: string;
    bairro: string;
    endereco_formatado?: string;
  };
  localizacao: {
    latitude: string;
    longitude: string;
  };
  // Campos opcionais que podem existir dependendo do tipo de consulta
  proprietario?: {
    nome_completo: string;
    cpf_cnpj: string;
  };
  dados_lote?: {
    cartografia_lote: string;
    endereco_completo_lote: string;
    cartografia: string;
    endereco_completo: string;
    endereco_numero: string;
    endereco_complemento: string;
    area_terreno: string;
    area_total_edificada: string;
    area_de_fato: string;
    tipo_ocupacao: string;
    tipo_ocupacao_lote: string;
    situacao_lote: string;
    topografia: string;
    pedologia: string;
  };
  dados_autonoma?: {
    matricula: string;
    cartorio_matricula: string;
    area_em_construcao: string;
    area_piscina: string;
    area_edificada: string;
    tipo_dominio: string;
    tipo_imovel: string;
    tipo_posicao_fiscal: string;
    tipo_situacao: string;
  };
  dados_edificacao?: {
    caracteristicas_gerais: {
      pavimentos_localizacao: string;
      pavimentos_unidade: string;
      pavimentos_total: string;
      data_construcao: string;
      andar: string;
      possui_elevador: string;
      area_privativa: string;
      area_comum: string;
      area_inferior: string;
      vagas_garagem: string;
      numero_suites: string;
      numero_dormitorios: string;
      numero_banheiros: string;
      padrao_construtivo: string;
      fator_edificacacao: string;
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
      "acabamento interno": string;
      "acabamento externo": string;
      instalacoes_eletrica: string;
      instalacoes_sanitaria: string;
    };
  };
}

export interface ErrorDataCpfCnpj {
  code: string;
  type: string;
  message: string;
}