import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, tap } from 'rxjs';

import { AuthService, PreferencesService } from '@services';
import { RegisterOpeningService } from '@domains/gestao-caixa/services/register-opening.service';
import { RegisterClosingCheckService } from './register-closing-check.service';
import { renderClosingReceiptHtml } from './utils/register-closing-receipt.template';
import type { FechamentoArmazenado, FechamentoCaixaPayload, FechamentoCaixaResponse, FechamentoCaixaSnapshot, FechamentoExtratosAutomaticos, FechamentoNotaPdf, FechamentoValoresInformados, } from '@domains/gestao-caixa/models/register-closing.types';

@Injectable({
  providedIn: 'root',
})
export class RegisterClosingService {
  private readonly authService = inject(AuthService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly registerOpeningService = inject(RegisterOpeningService);
  private readonly registerClosingCheckService = inject(RegisterClosingCheckService);
  private readonly storageKey = 'register-closing-last-record';

  buildPayload(
    dinheiroInformado: number,
    observacoes: string
  ): FechamentoCaixaPayload {
    const usuarioLogado = this.authService.getUsuarioLogado();
    const extratos = this.getAutomaticStatementValues();

    return {
      caixaId:
        this.registerOpeningService.getAberturaAtual()?.caixaId ??
        this.registerClosingCheckService.fallbackCaixaId,
      operadorId: usuarioLogado?.email ?? 'operador-demo',
      horarioFechamento: new Date().toISOString(),
      valoresInformados: this.normalizeValores({
        dinheiro: dinheiroInformado,
        cartaoCredito: extratos.cartaoCredito,
        cartaoDebito: extratos.cartaoDebito,
        pix: extratos.pix,
      }),
      observacoes: observacoes.trim() || 'Fechamento de caixa sem observações.',
    };
  }

  submitBlindClosing(
    payload: FechamentoCaixaPayload
  ): Observable<FechamentoCaixaResponse> {
    return of(this.conciliarFechamento(payload)).pipe(
      delay(350),
      tap((response) => {
        void this.persistClosingRecord(payload, response);
      })
    );
  }

  getExpectedValues(): FechamentoValoresInformados {
    return this.registerClosingCheckService.getExpectedValues();
  }

  getAutomaticStatementValues(): FechamentoExtratosAutomaticos {
    return this.registerClosingCheckService.getAutomaticStatementValues();
  }

  updateSnapshotState(
    snapshot: Partial<FechamentoCaixaSnapshot>
  ): FechamentoCaixaSnapshot {
    return this.registerClosingCheckService.updateSnapshotState(snapshot);
  }

  buildClosingNote(
    payload: FechamentoCaixaPayload,
    response: FechamentoCaixaResponse
  ): FechamentoNotaPdf {
    return {
      protocolo: response.fechamentoId,
      caixaId: payload.caixaId,
      operadorId: payload.operadorId,
      turno: response.detalhesOperacionais.turno,
      quantidadeVendas: response.detalhesOperacionais.quantidadeVendas,
      dataFechamento: response.detalhesOperacionais.dataFechamento,
      horaFechamento: response.detalhesOperacionais.horaFechamento,
      aberturaCaixa: response.detalhesOperacionais.aberturaCaixa,
      operadorAbertura: response.detalhesOperacionais.operadorAbertura,
      houveAtrasoAbertura: response.detalhesOperacionais.houveAtrasoAbertura,
      minutosAtrasoAbertura: response.detalhesOperacionais.minutosAtrasoAbertura,
      horarioPrevistoFechamento:
        response.detalhesOperacionais.horarioPrevistoFechamento,
      observacoes: payload.observacoes,
      valoresInformados: payload.valoresInformados,
      resumo: response.resumo,
      resultadoFinal: response.resultadoFinal,
    };
  }

  openClosingNotePdf(
    payload: FechamentoCaixaPayload,
    response: FechamentoCaixaResponse
  ): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const nota = this.buildClosingNote(payload, response);
    const printWindow = window.open('', '_blank', 'width=920,height=720');

    if (!printWindow) {
      return false;
    }

    printWindow.document.write(renderClosingReceiptHtml(nota));
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => {
      printWindow.print();
    }, 250);

    return true;
  }

  async getLastClosingRecord(): Promise<FechamentoArmazenado | null> {
    return this.preferencesService.getJson<FechamentoArmazenado | null>(
      this.storageKey,
      null
    );
  }

  private conciliarFechamento(
    payload: FechamentoCaixaPayload
  ): FechamentoCaixaResponse {
    return this.registerClosingCheckService.conciliarFechamento(payload);
  }

  private async persistClosingRecord(
    payload: FechamentoCaixaPayload,
    response: FechamentoCaixaResponse
  ): Promise<void> {
    await this.preferencesService.setJson<FechamentoArmazenado>(
      this.storageKey,
      {
        payload,
        response,
      }
    );
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
