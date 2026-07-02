import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { formatTime } from '@core/utils/date.utils';

import { API_URLS } from '@core/constants/api.constants';
import {
  RecentSaleRecord,
  RecentSalesDataService,
} from '@core/services/api/dashboard/recent-sales/recent-sales-data.service';

import {
  ConfirmedSale,
  FinalizedSalePayload,
  FinalizedSaleResponse,
  PaymentMethod,
  PdvMetodoPagamentoServer,
  PdvVendaServerRequest,
  PdvVendaServerResponse,
} from '@domains/pdv/types/pdv.types';
import {
  PAYMENT_API_NAMES,
} from '@domains/pdv/helpers/payment-method.helper';

@Injectable({
  providedIn: 'root',
})
export class PdvSaleSubmissionService {
  private readonly http = inject(HttpClient);
  private readonly recentSalesDataService = inject(RecentSalesDataService);
  private readonly salesHistory: FinalizedSaleResponse[] = [];

  submitSale(confirmedSale: ConfirmedSale): Observable<FinalizedSaleResponse> {
    const payload: FinalizedSalePayload = {
      operadorId: confirmedSale.operadorId,
      formaPagamento: confirmedSale.formaPagamento,
      valorTotal: confirmedSale.valorTotal,
      totalItens: confirmedSale.totalItens,
      itens: confirmedSale.itens.map((item) => ({
        sku: item.sku,
        quantidade: item.quantidade,
      })),
      dataHoraVenda: confirmedSale.dataHoraConfirmacao,
    };

    return this.resolvePaymentMethodId(confirmedSale.formaPagamento).pipe(
      switchMap((metodoPagamentoId) => {
        const request = this.buildServerRequest(confirmedSale, metodoPagamentoId);
        return this.http.post<PdvVendaServerResponse>(API_URLS.PDV.VENDAS, request).pipe(
          map((servidor) => {
            const vendaId = String(servidor.id ?? servidor.numero_venda ?? `sale-${Date.now()}`);
            return {
              status: 'sucesso' as const,
              vendaId,
              payloadRecebido: payload,
              servidor,
            };
          }),
          tap((response) => {
            this.salesHistory.unshift(response);
            void this.recentSalesDataService.registerRecentSale(
              this.buildRecentSaleRecord(confirmedSale, response)
            );
          }),
        );
      }),
    );
  }

  getSubmittedSales(): FinalizedSaleResponse[] {
    return [...this.salesHistory];
  }

  private resolvePaymentMethodId(method: PaymentMethod): Observable<number> {
    return forkJoin([
      this.http.get<unknown>(API_URLS.PDV.METODO_PAGAMENTOS_SYNC),
      this.http.get<unknown>(API_URLS.PDV.METODO_PAGAMENTOS),
    ]).pipe(
      map(([syncResponse, indexResponse]) => {
        const methods = [
          ...this.normalizePaymentMethods(syncResponse),
          ...this.normalizePaymentMethods(indexResponse),
        ];

        const paymentMethodName = PAYMENT_API_NAMES[method];
        const paymentMethod = methods.find((item) => item.nome.toLowerCase() === paymentMethodName.toLowerCase());

        if (!paymentMethod?.id) {
          throw new Error(`Metodo de pagamento "${paymentMethodName}" nao encontrado no servidor.`);
        }

        return paymentMethod.id;
      }),
      switchMap((methodId) => of(methodId)),
    );
  }

  private normalizePaymentMethods(response: unknown): PdvMetodoPagamentoServer[] {
    if (Array.isArray(response)) {
      return response
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
          id: Number(item['id']),
          nome: String(item['nome'] ?? ''),
        }))
        .filter((item) => Number.isFinite(item.id) && item.nome.length > 0);
    }

    if (response && typeof response === 'object') {
      const possibleCollections = ['data', 'items', 'metodo_pagamentos', 'metodos_pagamento'];

      for (const key of possibleCollections) {
        const collection = (response as Record<string, unknown>)[key];
        const normalized = this.normalizePaymentMethods(collection);
        if (normalized.length > 0) {
          return normalized;
        }
      }
    }

    return [];
  }

  private buildServerRequest(
    confirmedSale: ConfirmedSale,
    metodoPagamentoId: number,
  ): PdvVendaServerRequest {
    return {
      venda: {
        data_venda: confirmedSale.dataHoraConfirmacao,
        metodo_pagamento_id: metodoPagamentoId,
        status: 'concluida',
        subtotal: confirmedSale.valorTotal,
        valor_total: confirmedSale.valorTotal,
        valor_pago: confirmedSale.valorTotal,
        troco: 0,
        numero_parcelas: confirmedSale.formaPagamento === 'CREDITO' ? 1 : 1,
      },
    };
  }

  private buildRecentSaleRecord(
    confirmedSale: ConfirmedSale,
    response: FinalizedSaleResponse
  ): RecentSaleRecord {
    return {
      id: `#${response.vendaId}`,
      hora: formatTime(confirmedSale.dataHoraConfirmacao),
      valor: this.formatCurrencyLabel(confirmedSale.valorTotal),
      pagamento: this.mapRecentPaymentMethod(confirmedSale.formaPagamento),
      cliente: 'Consumidor final',
      itens: confirmedSale.itens.map((item) => ({
        nome: item.nome,
        quantidade: item.quantidade,
        valorUnitario: this.formatCurrencyLabel(item.precoUnitario),
      })),
    };
  }

  private mapRecentPaymentMethod(
    method: PaymentMethod
  ): RecentSaleRecord['pagamento'] {
    switch (method) {
      case 'DINHEIRO':
        return 'Dinheiro';
      case 'PIX':
        return 'PIX';
      case 'CREDITO':
        return 'Crédito';
      default:
        return 'Débito';
    }
  }

  private formatCurrencyLabel(value: number): string {
    return value.toFixed(2).replace('.', ',');
  }
}
