import { Injectable, inject } from '@angular/core';

import { PreferencesService } from '@services';
import type {
  FechamentoNotificacaoGerente,
  FechamentoSolicitacaoReavaliacao,
} from '@domains/gestao-caixa/models/register-closing.types';

@Injectable({
  providedIn: 'root',
})
export class RegisterClosingManagerNotificationService {
  private readonly preferencesService = inject(PreferencesService);
  private readonly storageKey = 'register-closing-manager-notifications';

  async listNotifications(): Promise<FechamentoNotificacaoGerente[]> {
    return this.preferencesService.getJson<FechamentoNotificacaoGerente[]>(
      this.storageKey,
      []
    );
  }

  async notifyPendingManagerReview(
    request: FechamentoSolicitacaoReavaliacao
  ): Promise<FechamentoNotificacaoGerente> {
    const notifications = await this.listNotifications();
    const notification: FechamentoNotificacaoGerente = {
      id: `ntf-${Date.now()}`,
      fechamentoId: request.fechamentoId,
      solicitacaoId: request.id,
      titulo: 'Fechamento com divergência aguardando gerente',
      mensagem:
        `Caixa ${request.caixaId} com divergência de ` +
        `${request.diferencaInicial.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })}.`,
      criadaEm: new Date().toISOString(),
    };

    await this.preferencesService.setJson(this.storageKey, [
      ...notifications,
      notification,
    ]);

    return notification;
  }

  async markAsRead(
    notificationId: string
  ): Promise<FechamentoNotificacaoGerente | null> {
    const notifications = await this.listNotifications();
    let updatedNotification: FechamentoNotificacaoGerente | null = null;

    const updated = notifications.map((notification) => {
      if (notification.id !== notificationId) {
        return notification;
      }

      updatedNotification = {
        ...notification,
        lidaEm: new Date().toISOString(),
      };

      return updatedNotification;
    });

    await this.preferencesService.setJson(this.storageKey, updated);

    return updatedNotification;
  }
}
