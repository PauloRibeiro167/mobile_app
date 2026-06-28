export type StatusCaixa = 'FECHADO' | 'ABERTO';

export interface FuncionamentoCaixaConfig {
  caixaId: string;
  horarioAbertura: string;
  horarioFechamento: string;
  toleranciaAtrasoMinutos: number;
}

export interface AberturaCaixaPayload {
  caixaId: string;
  operadorId: string;
  operadorNome: string;
  horarioAbertura: string;
  fundoTroco: number;
  observacoes: string;
  origemAcesso: 'quick-actions' | 'bottom-tab-bar' | 'direct-route';
}

export interface AberturaCaixaResponse {
  status: 'sucesso';
  aberturaId: string;
  statusCaixa: 'ABERTO';
  caixaId: string;
  operadorId: string;
  operadorNome: string;
  horarioAbertura: string;
  horarioAberturaFormatado: string;
  horarioPrevistoAbertura: string;
  horarioPrevistoFechamento: string;
  fundoTroco: number;
  observacoes: string;
  origemAcesso: AberturaCaixaPayload['origemAcesso'];
  mensagemSistema: string;
  houveAtraso: boolean;
  minutosAtraso: number;
}

export interface FechamentoLiberacaoCaixa {
  aberturaRealizada: boolean;
  podeFechar: boolean;
  motivo: string;
  horarioPrevistoAbertura: string;
  horarioPrevistoFechamento: string;
  statusCaixa: StatusCaixa;
}
