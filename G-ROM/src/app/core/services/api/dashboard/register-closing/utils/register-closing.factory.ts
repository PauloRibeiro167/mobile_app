import type {
  FechamentoCaixaResponse,
  FechamentoCaixaSnapshot,
  FechamentoExtratosAutomaticos,
  FechamentoResumoItem,
  FechamentoValoresInformados,
} from '@domains/gestao-caixa/types/register-closing.types';

export function buildRegisterClosingExpectedValues(
  snapshot: FechamentoCaixaSnapshot,
  fundoTrocoAbertura: number
): FechamentoValoresInformados {
  return {
    dinheiro: roundCurrency(
      fundoTrocoAbertura +
        snapshot.vendasDinheiro +
        snapshot.suprimentos -
        snapshot.sangrias -
        snapshot.devolucoesDinheiro
    ),
    cartaoCredito: snapshot.cartaoCredito,
    cartaoDebito: snapshot.cartaoDebito,
    pix: snapshot.pix,
  };
}

export function buildRegisterClosingAutomaticStatementValues(
  snapshot: FechamentoCaixaSnapshot
): FechamentoExtratosAutomaticos {
  return {
    cartaoCredito: snapshot.cartaoCredito,
    cartaoDebito: snapshot.cartaoDebito,
    pix: snapshot.pix,
  };
}

export function buildRegisterClosingResumoItem(
  esperado: number,
  informado: number
): FechamentoResumoItem {
  const diferenca = roundCurrency(informado - esperado);

  return {
    esperado,
    informado,
    diferenca,
    status:
      diferenca === 0 ? 'BATEU' : diferenca < 0 ? 'FALTA' : 'SOBRA',
  };
}

export function buildRegisterClosingResult(
  resumo: FechamentoCaixaResponse['resumo']
): FechamentoCaixaResponse['resultadoFinal'] {
  return Object.values(resumo).every((item) => item.status === 'BATEU')
    ? 'FECHADO_SEM_DIVERGENCIA'
    : 'QUEBRA_DE_CAIXA';
}

function roundCurrency(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
