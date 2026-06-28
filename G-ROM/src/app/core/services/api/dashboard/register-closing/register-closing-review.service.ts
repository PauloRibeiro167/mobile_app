import { Injectable, inject } from '@angular/core';

import { PreferencesService } from '@services';
import type {
  FechamentoCaixaPayload,
  FechamentoCaixaResponse,
  FechamentoResultadoFinal,
  FechamentoSolicitacaoReavaliacao,
} from '@domains/gestao-caixa/models/register-closing.types';

@Injectable({
  providedIn: 'root',
})
export class RegisterClosingReviewService {
  private readonly preferencesService = inject(PreferencesService);
  private readonly storageKey = 'register-closing-review-requests';

  async listRequests(): Promise<FechamentoSolicitacaoReavaliacao[]> {
    return this.preferencesService.getJson<FechamentoSolicitacaoReavaliacao[]>(
      this.storageKey,
      []
    );
  }

  async getRequestByClosingId(
    fechamentoId: string
  ): Promise<FechamentoSolicitacaoReavaliacao | null> {
    const requests = await this.listRequests();

    return requests.find((item) => item.fechamentoId === fechamentoId) ?? null;
  }

  async openManagerReview(params: {
    payload: FechamentoCaixaPayload;
    response: FechamentoCaixaResponse;
  }): Promise<FechamentoSolicitacaoReavaliacao> {
    const requests = await this.listRequests();
    const request: FechamentoSolicitacaoReavaliacao = {
      id: `rvl-${Date.now()}`,
      fechamentoId: params.response.fechamentoId,
      caixaId: params.payload.caixaId,
      operadorId: params.payload.operadorId,
      valorInformadoInicial: params.payload.valoresInformados.dinheiro,
      diferencaInicial: params.response.resumo.dinheiro.diferenca,
      status: 'pendente_reavaliacao_gerente',
      criadaEm: new Date().toISOString(),
    };

    await this.preferencesService.setJson(this.storageKey, [...requests, request]);

    return request;
  }

  async authorizeManagerReview(
    requestId: string,
    gerenteId: string
  ): Promise<FechamentoSolicitacaoReavaliacao | null> {
    const requests = await this.listRequests();
    let updatedRequest: FechamentoSolicitacaoReavaliacao | null = null;

    const updated = requests.map((request) => {
      if (request.id !== requestId) {
        return request;
      }

      updatedRequest = {
        ...request,
        status: 'reavaliacao_autorizada',
        autorizadaEm: new Date().toISOString(),
        autorizadaPor: gerenteId,
      };

      return updatedRequest;
    });

    await this.preferencesService.setJson(this.storageKey, updated);

    return updatedRequest;
  }

  async completeManagerReview(params: {
    requestId: string;
    gerenteId: string;
    valorReavaliado: number;
    resultadoReavaliacao: FechamentoResultadoFinal;
  }): Promise<FechamentoSolicitacaoReavaliacao | null> {
    const requests = await this.listRequests();
    let updatedRequest: FechamentoSolicitacaoReavaliacao | null = null;

    const updated = requests.map((request) => {
      if (request.id !== params.requestId) {
        return request;
      }

      updatedRequest = {
        ...request,
        status: 'reavaliado',
        reavaliadaEm: new Date().toISOString(),
        reavaliadaPor: params.gerenteId,
        valorReavaliado: params.valorReavaliado,
        resultadoReavaliacao: params.resultadoReavaliacao,
      };

      return updatedRequest;
    });

    await this.preferencesService.setJson(this.storageKey, updated);

    return updatedRequest;
  }

  canReevaluate(
    request: FechamentoSolicitacaoReavaliacao | null
  ): boolean {
    return request?.status === 'reavaliacao_autorizada';
  }
}
