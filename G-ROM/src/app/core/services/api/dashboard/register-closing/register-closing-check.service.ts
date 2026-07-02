import { Injectable, inject } from '@angular/core';

import { RegisterOpeningService } from '@domains/gestao-caixa/services/register-opening.service';
import { formatDate, formatTime, formatDateTime } from '../../../../utils/date.utils';
import { buildRegisterClosingAutomaticStatementValues, buildRegisterClosingExpectedValues, buildRegisterClosingResult, buildRegisterClosingResumoItem, } from './utils/register-closing.factory';
import { REGISTER_CLOSING_SNAPSHOT_INITIAL_STATE } from './utils/register-closing.snapshot';
import type { FechamentoCaixaPayload, FechamentoCaixaResponse, FechamentoCaixaSnapshot, FechamentoDetalhesOperacionais, FechamentoExtratosAutomaticos, FechamentoResumoItem, FechamentoValoresInformados, } from '@domains/gestao-caixa/types/register-closing.types';

@Injectable({
  providedIn: 'root',
})
  
export class RegisterClosingCheckService {
  private readonly registerOpeningService = inject(RegisterOpeningService);

  private fechamentoSnapshotState: FechamentoCaixaSnapshot = {
    ...REGISTER_CLOSING_SNAPSHOT_INITIAL_STATE,
  };

  get fallbackCaixaId(): string {
    return this.fechamentoSnapshotState.caixaId;
  }

  getExpectedValues(): FechamentoValoresInformados {
    const fundoTrocoAbertura =
      this.registerOpeningService.getAberturaAtual()?.fundoTroco ??
      this.fechamentoSnapshotState.fundoTroco;

    return buildRegisterClosingExpectedValues(
      this.fechamentoSnapshotState,
      fundoTrocoAbertura
    );
  }

  getAutomaticStatementValues(): FechamentoExtratosAutomaticos {
    return buildRegisterClosingAutomaticStatementValues(
      this.fechamentoSnapshotState
    );
  }

  updateSnapshotState(
    snapshot: Partial<FechamentoCaixaSnapshot>
  ): FechamentoCaixaSnapshot {
    this.fechamentoSnapshotState = {
      ...this.fechamentoSnapshotState,
      ...snapshot,
    };

    return this.fechamentoSnapshotState;
  }

  conciliarFechamento(
    payload: FechamentoCaixaPayload
  ): FechamentoCaixaResponse {
    const esperado = this.getExpectedValues();
    const informado = this.normalizeValores(payload.valoresInformados);
    const resumo: FechamentoCaixaResponse['resumo'] = {
      dinheiro: this.buildResumoItem(esperado.dinheiro, informado.dinheiro),
      cartaoCredito: this.buildResumoItem(
        esperado.cartaoCredito,
        informado.cartaoCredito
      ),
      cartaoDebito: this.buildResumoItem(
        esperado.cartaoDebito,
        informado.cartaoDebito
      ),
      pix: this.buildResumoItem(esperado.pix, informado.pix),
    };

    return {
      status: 'sucesso',
      fechamentoId: `fcx-${Date.now()}`,
      resumo,
      resultadoFinal: buildRegisterClosingResult(resumo),
      detalhesOperacionais: this.buildOperationalDetails(payload.horarioFechamento),
    };
  }

  private buildOperationalDetails(
    horarioFechamento: string
  ): FechamentoDetalhesOperacionais {
    const fechamento = new Date(horarioFechamento);
    const dataFechamento = formatDate(fechamento);
    const horaFechamento = formatTime(fechamento);
    const aberturaAtual = this.registerOpeningService.getAberturaAtual();
    const aberturaCaixa = aberturaAtual
      ? formatDateTime(new Date(aberturaAtual.horarioAbertura))
      : `${formatDate(
          new Date(this.fechamentoSnapshotState.aberturaCaixa)
        )} ${formatTime(new Date(this.fechamentoSnapshotState.aberturaCaixa))}`;

    return {
      turno: this.fechamentoSnapshotState.turno,
      quantidadeVendas: this.fechamentoSnapshotState.quantidadeVendas,
      dataFechamento,
      horaFechamento,
      aberturaCaixa,
      operadorAbertura: aberturaAtual?.operadorId ?? 'operador-demo',
      houveAtrasoAbertura: aberturaAtual?.houveAtraso ?? false,
      minutosAtrasoAbertura: aberturaAtual?.minutosAtraso ?? 0,
      horarioPrevistoFechamento:
        aberturaAtual?.horarioPrevistoFechamento ?? '22:00',
    };
  }

  private buildResumoItem(
    esperado: number,
    informado: number
  ): FechamentoResumoItem {
    return buildRegisterClosingResumoItem(esperado, informado);
  }

  private normalizeValores(
    valores: FechamentoValoresInformados
  ): FechamentoValoresInformados {
    return {
      dinheiro: this.roundCurrency(valores.dinheiro),
      cartaoCredito: this.roundCurrency(valores.cartaoCredito),
      cartaoDebito: this.roundCurrency(valores.cartaoDebito),
      pix: this.roundCurrency(valores.pix),
    };
  }

  private roundCurrency(value: number): number {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }
}
