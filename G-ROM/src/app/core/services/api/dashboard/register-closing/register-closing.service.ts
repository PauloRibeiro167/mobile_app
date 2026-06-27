import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, tap } from 'rxjs';

import { AuthService, PreferencesService } from '@services';
import { RegisterOpeningService } from '../register-opening/register-opening.service';
import { renderClosingReceiptHtml } from './register-closing-receipt.template';

export type FechamentoFormaPagamento =
  | 'dinheiro'
  | 'cartaoCredito'
  | 'cartaoDebito'
  | 'pix';

export type FechamentoItemStatus = 'BATEU' | 'FALTA' | 'SOBRA';
export type FechamentoResultadoFinal =
  | 'FECHADO_SEM_DIVERGENCIA'
  | 'QUEBRA_DE_CAIXA';

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

interface FechamentoCaixaSnapshot {
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

export interface FechamentoCaixaFixtures {
  payloadExemplo: FechamentoCaixaPayload;
  responseExemplo: FechamentoCaixaResponse;
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
  nota: FechamentoNotaPdf;
}

@Injectable({
  providedIn: 'root',
})
export class RegisterClosingService {
  private readonly authService = inject(AuthService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly registerOpeningService = inject(RegisterOpeningService);
  private readonly storageKey = 'register-closing-last-record';

  private readonly fechamentoSnapshotMock: FechamentoCaixaSnapshot = {
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

  readonly fixtures: FechamentoCaixaFixtures = {
    payloadExemplo: {
      caixaId: '12345',
      operadorId: '987',
      horarioFechamento: '2026-06-13T11:54:16Z',
      valoresInformados: {
        dinheiro: 450.5,
        cartaoCredito: 1200,
        cartaoDebito: 850,
        pix: 300,
      },
      observacoes: 'Fechamento do turno da manhã.',
    },
    responseExemplo: {
      status: 'sucesso',
      fechamentoId: '99988',
      resumo: {
        dinheiro: {
          esperado: 450.5,
          informado: 450.5,
          diferenca: 0,
          status: 'BATEU',
        },
        cartaoCredito: {
          esperado: 1250,
          informado: 1200,
          diferenca: -50,
          status: 'FALTA',
        },
        cartaoDebito: {
          esperado: 850,
          informado: 850,
          diferenca: 0,
          status: 'BATEU',
        },
        pix: {
          esperado: 300,
          informado: 300,
          diferenca: 0,
          status: 'BATEU',
        },
      },
      resultadoFinal: 'QUEBRA_DE_CAIXA',
      detalhesOperacionais: {
        turno: 'Turno manhã',
        quantidadeVendas: 28,
        dataFechamento: '13/06/2026',
        horaFechamento: '08:54',
        aberturaCaixa: '13/06/2026 07:00',
        operadorAbertura: 'operador-demo',
        houveAtrasoAbertura: false,
        minutosAtrasoAbertura: 0,
        horarioPrevistoFechamento: '22:00',
      },
    },
  };

  buildPayload(
    dinheiroInformado: number,
    observacoes: string
  ): FechamentoCaixaPayload {
    const usuarioLogado = this.authService.getUsuarioLogado();
    const extratos = this.getAutomaticStatementValues();

    return {
      caixaId:
        this.registerOpeningService.getAberturaAtual()?.caixaId ??
        this.fechamentoSnapshotMock.caixaId,
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
    const fundoTrocoAbertura =
      this.registerOpeningService.getAberturaAtual()?.fundoTroco ??
      this.fechamentoSnapshotMock.fundoTroco;

    return {
      dinheiro: this.roundCurrency(
        fundoTrocoAbertura +
          this.fechamentoSnapshotMock.vendasDinheiro +
          this.fechamentoSnapshotMock.suprimentos -
          this.fechamentoSnapshotMock.sangrias -
          this.fechamentoSnapshotMock.devolucoesDinheiro
      ),
      cartaoCredito: this.fechamentoSnapshotMock.cartaoCredito,
      cartaoDebito: this.fechamentoSnapshotMock.cartaoDebito,
      pix: this.fechamentoSnapshotMock.pix,
    };
  }

  getAutomaticStatementValues(): FechamentoExtratosAutomaticos {
    return {
      cartaoCredito: this.fechamentoSnapshotMock.cartaoCredito,
      cartaoDebito: this.fechamentoSnapshotMock.cartaoDebito,
      pix: this.fechamentoSnapshotMock.pix,
    };
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

    const resultadoFinal = Object.values(resumo).every(
      (item) => item.status === 'BATEU'
    )
      ? 'FECHADO_SEM_DIVERGENCIA'
      : 'QUEBRA_DE_CAIXA';

    return {
      status: 'sucesso',
      fechamentoId: `fcx-${Date.now()}`,
      resumo,
      resultadoFinal,
      detalhesOperacionais: this.buildOperationalDetails(payload.horarioFechamento),
    };
  }

  private async persistClosingRecord(
    payload: FechamentoCaixaPayload,
    response: FechamentoCaixaResponse
  ): Promise<void> {
    const nota = this.buildClosingNote(payload, response);

    await this.preferencesService.setJson<FechamentoArmazenado>(
      this.storageKey,
      {
        payload,
        response,
        nota,
      }
    );
  }

  private buildOperationalDetails(
    horarioFechamento: string
  ): FechamentoDetalhesOperacionais {
    const fechamento = new Date(horarioFechamento);
    const dataFechamento = this.formatDate(fechamento);
    const horaFechamento = this.formatTime(fechamento);
    const aberturaAtual = this.registerOpeningService.getAberturaAtual();
    const aberturaCaixa = aberturaAtual
      ? this.formatDateTime(new Date(aberturaAtual.horarioAbertura))
      : `${this.formatDate(
          new Date(this.fechamentoSnapshotMock.aberturaCaixa)
        )} ${this.formatTime(new Date(this.fechamentoSnapshotMock.aberturaCaixa))}`;

    return {
      turno: this.fechamentoSnapshotMock.turno,
      quantidadeVendas: this.fechamentoSnapshotMock.quantidadeVendas,
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
    const diferenca = this.roundCurrency(informado - esperado);

    return {
      esperado,
      informado,
      diferenca,
      status:
        diferenca === 0 ? 'BATEU' : diferenca < 0 ? 'FALTA' : 'SOBRA',
    };
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

  private formatDate(value: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Fortaleza',
    }).format(value);
  }

  private formatTime(value: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Fortaleza',
    }).format(value);
  }

  private formatDateTime(value: Date): string {
    return `${this.formatDate(value)} ${this.formatTime(value)}`;
  }
}
