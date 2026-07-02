import type { FechamentoCaixaSnapshot } from '@domains/gestao-caixa/types/register-closing.types';

export const REGISTER_CLOSING_SNAPSHOT_INITIAL_STATE: FechamentoCaixaSnapshot = {
  caixaId: '12345',
  turno: 'Turno manhã',
  quantidadeVendas: 28,
  aberturaCaixa: '2026-06-13T07:00:00Z',
  fundoTroco: 50,
  vendasDinheiro: 425.5,
  suprimentos: 25,
  sangrias: 50,
  devolucoesDinheiro: 0,
  cartaoCredito: 1250,
  cartaoDebito: 850,
  pix: 300,
};
