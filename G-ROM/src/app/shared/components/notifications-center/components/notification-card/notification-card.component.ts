import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import type { AppNotification } from '@services/api/notification/notification.service';
import {
  getNotificationIcon,
  getNotificationPriorityClass,
  getNotificationTypeClass,
} from '../../notification-presentation.utils';

@Component({
  selector: 'app-notification-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-card.component.html',
  styleUrls: ['./notification-card.component.css'],
})
export class NotificationCardComponent {
  @Input({ required: true }) notification!: AppNotification;

  get priorityClass(): string {
    return getNotificationPriorityClass(this.notification);
  }

  get iconClass(): string {
    return `bi ${getNotificationIcon(this.notification.type)}`;
  }

  get typeClass(): string {
    return getNotificationTypeClass(this.notification.type);
  }
}
