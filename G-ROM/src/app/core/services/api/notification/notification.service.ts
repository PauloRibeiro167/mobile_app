import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalNotifications } from '@capacitor/local-notifications';

export type NotificationType =
  | 'stock'
  | 'price'
  | 'system'
  | 'closing'
  | 'success'
  | 'marketing'
  | 'direct';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface AppNotification {
  id: number;
  userId?: string;
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: Date;
  createdAt?: Date;
  read: boolean;
}

export interface NotificationInput {
  userId?: string;
  title: string;
  body: string;
  type: NotificationType;
  priority?: NotificationPriority;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private readonly priorityColorMap: Record<NotificationPriority, string> = {
    low: '#879484',
    normal: '#66df75',
    high: '#ffb77d',
    urgent: '#ffb4ab',
  };

  constructor() {
    this.initLocalNotifications();
    this.loadMockNotifications();
  }

  private async initLocalNotifications() {
    try {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        console.warn('Permissão para notificações nativas negada');
      }
    } catch (e) {
      console.error('Erro ao inicializar notificações locais:', e);
    }
  }

  private loadMockNotifications() {
    const mocks: AppNotification[] = [
      {
        id: 1,
        userId: 'demo-user',
        title: 'Estoque Crítico',
        body: 'Arroz Tio João 5kg atingiu o limite mínimo (2 un).',
        type: 'stock',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        createdAt: new Date(Date.now() - 1000 * 60 * 15),
        read: false,
      },
      {
        id: 2,
        userId: 'demo-user',
        title: 'Ajuste de Preços',
        body: 'Novos preços aplicados para a categoria "Hortifruti".',
        type: 'price',
        priority: 'normal',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
        read: false,
      },
      {
        id: 3,
        userId: 'demo-user',
        title: 'Fechamento Próximo',
        body: 'Faltam 30 minutos para o horário de fechamento do caixa.',
        type: 'closing',
        priority: 'urgent',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        createdAt: new Date(Date.now() - 1000 * 60 * 120),
        read: true,
      },
      {
        id: 4,
        userId: 'demo-user',
        title: 'Meta Batida!',
        body: 'Parabéns! Você atingiu 100% da meta de vendas do turno.',
        type: 'success',
        priority: 'low',
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
        createdAt: new Date(Date.now() - 1000 * 60 * 180),
        read: true,
      },
    ];
    this.notificationsSubject.next(mocks);
  }

  /**
   * Marca uma única notificação como lida
   */
  markAsRead(id: number) {
    const current = this.notificationsSubject.value;
    const updated = current.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
  }

  markAllAsRead() {
    const updated = this.notificationsSubject.value.map((n) => ({
      ...n,
      read: true,
    }));
    this.notificationsSubject.next(updated);
  }

  clearAll() {
    this.notificationsSubject.next([]);
  }

  addNotification(input: NotificationInput) {
    const notification = this.createNotification(input);
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
    return notification;
  }

  async sendNotification(input: NotificationInput) {
    const newNotification = this.addNotification(input);

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: newNotification.title,
            body: newNotification.body,
            id: newNotification.id,
            schedule: { at: new Date(Date.now() + 500) },
            sound: 'default',
          },
        ],
      });
    } catch (e) {}
  }

  getPriorityColor(priority: NotificationPriority): string {
    return this.priorityColorMap[priority] ?? this.priorityColorMap.normal;
  }

  resolvePriorityColor(
    notification: AppNotification,
    resolver?: (notification: AppNotification) => string
  ): string {
    if (resolver) {
      return resolver(notification);
    }
    return this.getPriorityColor(notification.priority);
  }

  private createNotification(input: NotificationInput): AppNotification {
    const now = new Date();
    return {
      id: Date.now(),
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      priority: input.priority ?? 'normal',
      timestamp: input.createdAt ?? now,
      createdAt: input.createdAt ?? now,
      read: false,
    };
  }
  getSnapshot(): AppNotification[] {
    return this.notificationsSubject.value;
  }
}
