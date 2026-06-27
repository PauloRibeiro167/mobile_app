import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  OnInit,
} from '@angular/core';
import {
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonModal,
} from '@ionic/angular/standalone';
import { NotificationService } from '../../../core/services/api/notification/notification.service';
import { map, Observable } from 'rxjs';
import { NotificationsModalComponent } from '../notifications-modal/notifications-modal.component';
import { MenuToggleButtonComponent } from '../menu-toggle-button/menu-toggle-button.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonModal,
    NotificationsModalComponent,
    MenuToggleButtonComponent,
  ],
})
export class HeaderComponent implements OnInit {
  private notificationService = inject(NotificationService);

  @Input() title: string = 'Mercadinho';
  @Input() showMenuButton: boolean = true;
  @Input() showBackButton: boolean = false;
  @Input() icon: string = 'bi-shop-window';
  @Input() themeClass: string = '';
  @Output() closeMenu = new EventEmitter<Event>();

  unreadCount$ = this.notificationService.notifications$.pipe(
    map((notifications) => notifications.filter((n) => !n.read).length)
  );

  presentingElement: HTMLElement | null = null;

  ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
  }

  onCloseMenu(event: Event) {
    this.closeMenu.emit(event);
  }

  testNotification() {
    this.notificationService.sendNotification({
      title: 'Alerta de Teste',
      body: 'Isso é uma simulação de notificação nativa!',
      type: 'system',
      priority: 'normal',
    });
  }
}
