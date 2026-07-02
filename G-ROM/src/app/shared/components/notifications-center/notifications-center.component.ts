import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, ModalController, } from '@ionic/angular/standalone';
import { AppNotification } from '@services/api/notification/notification.service';
import { NotificationCardComponent } from './components/notification-card/notification-card.component';
import { NotificationsCenterFacade } from './services/notifications-center.facade';

@Component({
  selector: 'app-notifications-center',
  templateUrl: './notifications-center.component.html',
  styleUrls: ['./notifications-center.component.css'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, NotificationCardComponent],
})
export class NotificationsCenterComponent {
  private readonly notificationsFacade = inject(NotificationsCenterFacade);
  private readonly modalCtrl = inject(ModalController);

  readonly notifications$ = this.notificationsFacade.unreadNotifications$;

  close(): void {
    this.modalCtrl.dismiss();
  }

  clearAll(): void {
    this.notificationsFacade.clearAll();
  }

  trackByFn(index: number, item: AppNotification): number {
    void index;
    return item.id;
  }
}
