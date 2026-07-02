import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs';

import {
  AppNotification,
  NotificationInput,
  NotificationService,
} from '@services/api/notification/notification.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationsCenterFacade {
  private readonly notificationService = inject(NotificationService);

  readonly notifications$ = this.notificationService.notifications$;
  readonly unreadNotifications$ = this.notifications$.pipe(
    map((notifications) => notifications.filter((notification) => !notification.read)),
  );
  readonly unreadCount$ = this.unreadNotifications$.pipe(
    map((notifications) => notifications.length),
  );

  clearAll(): void {
    this.notificationService.clearAll();
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  send(input: NotificationInput): Promise<void> {
    return this.notificationService.sendNotification(input);
  }

  snapshot(): AppNotification[] {
    return this.notificationService.getSnapshot();
  }
}
