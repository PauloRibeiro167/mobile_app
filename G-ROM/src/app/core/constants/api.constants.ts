import { RUNTIME_CONFIG } from './runtime-config.constants';

/**
 * Configurações centralizadas da API consumida pelo app.
 */
export const API_CONFIG = {
  BASE_URL: RUNTIME_CONFIG.API_BASE_URL,
  PDV: {
    ENDPOINTS: {
      VENDAS: '/v1/pdv/vendas',
      METODO_PAGAMENTOS: '/v1/pdv/metodo_pagamentos',
      METODO_PAGAMENTOS_SYNC: '/v1/pdv/metodo_pagamentos/sync',
    }
  },
  APP_CONSULTA: {
    ENDPOINTS: {
      /** API para consulta detalhada de dados cadastrais por inscrição */
      DADOS_CADASTRAIS: '/app_consulta/dados_cadastrais',
      /** API para listagem de inscrições por CPF/CNPJ */
      DADOS_LIST: '/app_consulta/dados_list'
    }
  }
} as const;

/**
 * URLs das APIs organizadas por funcionalidade
 */
export const API_URLS = {
  PDV: {
    VENDAS: `${API_CONFIG.BASE_URL}${API_CONFIG.PDV.ENDPOINTS.VENDAS}`,
    METODO_PAGAMENTOS: `${API_CONFIG.BASE_URL}${API_CONFIG.PDV.ENDPOINTS.METODO_PAGAMENTOS}`,
    METODO_PAGAMENTOS_SYNC: `${API_CONFIG.BASE_URL}${API_CONFIG.PDV.ENDPOINTS.METODO_PAGAMENTOS_SYNC}`,
  },
  APP_CONSULTA: {
    /** URL completa para consulta de dados cadastrais detalhados */
    DADOS_CADASTRAIS: `${API_CONFIG.BASE_URL}${API_CONFIG.APP_CONSULTA.ENDPOINTS.DADOS_CADASTRAIS}`,
    /** URL completa para listagem de inscrições */
    DADOS_LIST: `${API_CONFIG.BASE_URL}${API_CONFIG.APP_CONSULTA.ENDPOINTS.DADOS_LIST}`
  }
} as const;
