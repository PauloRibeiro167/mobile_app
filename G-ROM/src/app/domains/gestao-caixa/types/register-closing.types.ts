export type FechamentoFormaPagamento =
  | 'dinheiro'
  | 'cartaoCredito'
  | 'cartaoDebito'
  | 'pix';

export type FechamentoItemStatus = 'BATEU' | 'FALTA' | 'SOBRA';
export type FechamentoResultadoFinal =
  | 'FECHADO_SEM_DIVERGENCIA'
  | 'QUEBRA_DE_CAIXA';
export type FechamentoProcessoTipo =
  | 'operator-closing'
  | 'manager-review';
export type FechamentoReavaliacaoStatus =
  | 'pendente_reavaliacao_gerente'
  | 'reavaliacao_autorizada'
  | 'reavaliado';

export interface FechamentoValoresInformados {
  dinheiro: number;
  cartaoCredito: number;
  cartaoDebito: number;
  pix: number;
}

export interface FechamentoCaixaPayload {
  caixaId: string;
  operadorId: string;
  horarioFechamento: string;
  valoresInformados: FechamentoValoresInformados;
  observacoes: string;
}

export interface FechamentoResumoItem {
  esperado: number;
  informado: number;
  diferenca: number;
  status: FechamentoItemStatus;
}

export interface FechamentoDetalhesOperacionais {
  turno: string;
  quantidadeVendas: number;
  dataFechamento: string;
  horaFechamento: string;
  aberturaCaixa: string;
  operadorAbertura: string;
  houveAtrasoAbertura: boolean;
  minutosAtrasoAbertura: number;
  horarioPrevistoFechamento: string;
}

export interface FechamentoCaixaResponse {
  status: 'sucesso';
  fechamentoId: string;
  resumo: Record<FechamentoFormaPagamento, FechamentoResumoItem>;
  resultadoFinal: FechamentoResultadoFinal;
  detalhesOperacionais: FechamentoDetalhesOperacionais;
}

export interface FechamentoExtratosAutomaticos {
  cartaoCredito: number;
  cartaoDebito: number;
  pix: number;
}

export interface FechamentoNotaPdf {
  protocolo: string;
  caixaId: string;
  operadorId: string;
  turno: string;
  quantidadeVendas: number;
  dataFechamento: string;
  horaFechamento: string;
  aberturaCaixa: string;
  operadorAbertura: string;
  houveAtrasoAbertura: boolean;
  minutosAtrasoAbertura: number;
  horarioPrevistoFechamento: string;
  observacoes: string;
  valoresInformados: FechamentoValoresInformados;
  resumo: Record<FechamentoFormaPagamento, FechamentoResumoItem>;
  resultadoFinal: FechamentoResultadoFinal;
}

export interface FechamentoArmazenado {
  payload: FechamentoCaixaPayload;
  response: FechamentoCaixaResponse;
}

export interface FechamentoSolicitacaoReavaliacao {
  id: string;
  fechamentoId: string;
  caixaId: string;
  operadorId: string;
  valorInformadoInicial: number;
  diferencaInicial: number;
  status: FechamentoReavaliacaoStatus;
  criadaEm: string;
  notificadaEm?: string;
  autorizadaEm?: string;
  autorizadaPor?: string;
  reavaliadaEm?: string;
  reavaliadaPor?: string;
  valorReavaliado?: number;
  resultadoReavaliacao?: FechamentoResultadoFinal;
}

export interface FechamentoNotificacaoGerente {
  id: string;
  fechamentoId: string;
  solicitacaoId: string;
  titulo: string;
  mensagem: string;
  criadaEm: string;
  lidaEm?: string;
}

export interface FechamentoCaixaSnapshot {
  caixaId: string;
  turno: string;
  quantidadeVendas: number;
  aberturaCaixa: string;
  fundoTroco: number;
  vendasDinheiro: number;
  suprimentos: number;
  sangrias: number;
  devolucoesDinheiro: number;
  cartaoCredito: number;
  cartaoDebito: number;
  pix: number;
}
