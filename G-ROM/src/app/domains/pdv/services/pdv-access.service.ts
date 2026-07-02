import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type { AberturaCaixaResponse } from '@domains/gestao-caixa/types/register-opening.types';
import { RegisterOpeningService } from '@domains/gestao-caixa/services/register-opening.service';

export type PdvAccessOrigin =
  | 'quick-actions'
  | 'bottom-tab-bar'
  | 'direct-route';

export interface PdvOpeningDraft {
  origem: PdvAccessOrigin;
  fundoTrocoSugerido: number;
  observacoesPadrao: string;
  titulo: string;
  descricao: string;
}

export type PdvAccessResult =
  | { status: 'granted'; session: AberturaCaixaResponse }
  | { status: 'requires-opening'; draft: PdvOpeningDraft };

@Injectable({
  providedIn: 'root',
})
export class PdvAccessService {
  private readonly registerOpeningService = inject(RegisterOpeningService);

  async initialize(): Promise<void> {
    await this.registerOpeningService.initialize();
  }

  canAccessPdvDirectly(): boolean {
    return !!this.registerOpeningService.getAberturaAtual();
  }

  async requestPdvAccess(origem: PdvAccessOrigin): Promise<PdvAccessResult> {
    await this.initialize();

    const session = this.registerOpeningService.getAberturaAtual();

    if (session) {
      return {
        status: 'granted',
        session,
      };
    }

    return {
      status: 'requires-opening',
      draft: this.getOpeningDraft(origem),
    };
  }

  getOpeningDraft(origem: PdvAccessOrigin): PdvOpeningDraft {
    return {
      origem,
      fundoTrocoSugerido: 50,
      observacoesPadrao: this.getDefaultObservation(origem),
      titulo: 'Conferir abertura do caixa',
      descricao:
        'Confirme o valor inicial em caixa para liberar o acesso ao PDV.',
    };
  }

  async confirmOpening(
    fundoTroco: number,
    observacoes: string,
    origem: PdvAccessOrigin
  ): Promise<AberturaCaixaResponse> {
    await this.initialize();

    return firstValueFrom(
      this.registerOpeningService.solicitarAbertura(
        fundoTroco,
        observacoes,
        new Date(),
        origem
      )
    );
  }

  getBlockedAccessMessage(): string {
    return 'Caixa fechado. Faça a conferência inicial e informe o fundo de troco antes de abrir o PDV.';
  }

  private getDefaultObservation(origem: PdvAccessOrigin): string {
    switch (origem) {
      case 'bottom-tab-bar':
        return 'Abertura solicitada pela barra inferior de navegação.';
      case 'quick-actions':
        return 'Abertura solicitada pelos atalhos da dashboard.';
      default:
        return 'Abertura solicitada por acesso direto ao PDV.';
    }
  }
}
