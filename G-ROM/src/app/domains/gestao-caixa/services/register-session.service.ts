import { Injectable, inject } from '@angular/core';

import {
  AberturaCaixaResponse,
} from '@domains/gestao-caixa/types/register-opening.types';
import { RegisterOpeningService } from './register-opening.service';

@Injectable({
  providedIn: 'root',
})
export class RegisterSessionService {
  private readonly registerOpeningService = inject(RegisterOpeningService);

  async initialize(): Promise<void> {
    await this.registerOpeningService.initialize();
  }

  hasOpenSession(): boolean {
    return !!this.registerOpeningService.getAberturaAtual();
  }

  getCurrentSession(): AberturaCaixaResponse | null {
    return this.registerOpeningService.getAberturaAtual();
  }

  getSessionSummary(): string {
    const session = this.getCurrentSession();

    if (!session) {
      return 'Caixa fechado. Faça a conferência inicial antes de entrar no PDV.';
    }

    return `Caixa aberto por ${session.operadorNome ?? session.operadorId} às ${session.horarioAberturaFormatado}.`;
  }

  async ensureSessionForPdv(): Promise<AberturaCaixaResponse> {
    await this.initialize();

    const currentSession = this.getCurrentSession();

    if (currentSession) {
      return currentSession;
    }

    throw new Error(
      'Caixa fechado. A abertura precisa ser confirmada manualmente antes de acessar o PDV.'
    );
  }

  canCloseRegister(now = new Date()): boolean {
    void now;
    return this.hasOpenSession();
  }

  getClosingSummary(now = new Date()): string {
    void now;

    const session = this.getCurrentSession();

    if (!session) {
      return 'Caixa fechado. Abra o caixa antes de iniciar a conferência de fechamento.';
    }

    return `Caixa aberto por ${session.operadorNome ?? session.operadorId}. Faça a conferência final para encerrar o turno e gerar o PDF.`;
  }

  closeCurrentSession(): void {
    this.registerOpeningService.resetAbertura();
  }
}
