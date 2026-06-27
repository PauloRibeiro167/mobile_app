import { AlertType } from '@components';
import { BuscaRecenteLocalizacao } from '@core/models';

export type TipoDocumento = 'CPF' | 'CNPJ' | 'Inscrição';

export interface BuscaRecente {
  tipo: TipoDocumento | string;
  valor: string;
  data: Date;
  bbox?: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  distrito?: string;
  quadra?: string;
  lote?: string;
  endereco?: string;
  enderecoCompleto?: string;
  bairro?: string;
  cep?: string;
  localizacao?: BuscaRecenteLocalizacao;
  dadosCompletos?: any;
}

export interface SearchForm {
  cpfCnpj: string;
  inscricaoImobiliaria: string;
}
export interface AlertButtonEvent {
  role: string;
  data?: any;
}
export const MAX_VISIBLE_SEARCHES = 3;
