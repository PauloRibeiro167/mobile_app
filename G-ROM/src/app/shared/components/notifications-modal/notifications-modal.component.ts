import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, ModalController, } from '@ionic/angular/standalone';
import { NotificationService, AppNotification, } from '@services/api/notification/notification.service';
import { map, Observable, tap } from 'rxjs';

@Component({
  selector: 'app-notifications-modal',
  templateUrl: './notifications-modal.component.html',
  styleUrls: ['./notifications-modal.component.css'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar],
})
export class NotificationsModalComponent {
  private notificationService = inject(NotificationService);
  private modalCtrl = inject(ModalController);

  notifications$: Observable<AppNotification[]> =
    this.notificationService.notifications$.pipe(
      map((notifications) => notifications.filter((n) => !n.read)),
    );

  close() {
    this.modalCtrl.dismiss();
  }

  clearAll() {
    this.notificationService.clearAll();
  }

  getPriorityClass(notification: AppNotification): string {
    return `priority-${notification.priority}`;
  }

  getIcon(type: string): string {
    switch (type) {
      case 'stock':
        return 'bi-box-seam-fill';
      case 'price':
        return 'bi-tag-fill';
      case 'closing':
        return 'bi-clock-fill';
      case 'success':
        return 'bi-check-circle-fill';
      default:
        return 'bi-bell-fill';
    }
  }

  getTypeClass(type: string): string {
    return `type-${type}`;
  }

  // Função trackBy para melhorar a performance e renderização do ngFor
  trackByFn(index: number, item: AppNotification) {
    return item.id;
  }
}
