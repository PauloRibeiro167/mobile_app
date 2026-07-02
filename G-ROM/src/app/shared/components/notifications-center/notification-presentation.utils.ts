import type {
  AppNotification,
  NotificationPriority,
  NotificationType,
} from '@services/api/notification/notification.service';

const ICON_MAP: Record<NotificationType, string> = {
  stock: 'bi-box-seam-fill',
  price: 'bi-tag-fill',
  closing: 'bi-clock-fill',
  success: 'bi-check-circle-fill',
  marketing: 'bi-stars',
  direct: 'bi-chat-left-text-fill',
  system: 'bi-bell-fill',
};

const TYPE_CLASS_MAP: Record<NotificationType, string> = {
  stock: 'type-stock',
  price: 'type-price',
  closing: 'type-closing',
  success: 'type-success',
  marketing: 'type-system',
  direct: 'type-system',
  system: 'type-system',
};

const PRIORITY_CLASS_MAP: Record<NotificationPriority, string> = {
  low: 'priority-low',
  normal: 'priority-normal',
  high: 'priority-high',
  urgent: 'priority-urgent',
};

export function getNotificationIcon(type: NotificationType): string {
  return ICON_MAP[type] ?? ICON_MAP.system;
}

export function getNotificationTypeClass(type: NotificationType): string {
  return TYPE_CLASS_MAP[type] ?? TYPE_CLASS_MAP.system;
}

export function getNotificationPriorityClass(
  notification: AppNotification
): string {
  return PRIORITY_CLASS_MAP[notification.priority] ?? PRIORITY_CLASS_MAP.normal;
}
