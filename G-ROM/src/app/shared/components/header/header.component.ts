import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, OnInit, } from '@angular/core';
import { IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonModal, } from '@ionic/angular/standalone';
import { NotificationsCenterComponent } from '../notifications-center/notifications-center.component';
import { NotificationsCenterFacade } from '../notifications-center/services/notifications-center.facade';
import { MenuToggleButtonComponent } from '../menu-toggle-button/menu-toggle-button.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [ CommonModule, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonModal, NotificationsCenterComponent, MenuToggleButtonComponent,
  ],
})
export class HeaderComponent implements OnInit {
  private readonly notificationsFacade = inject(NotificationsCenterFacade);

  @Input() title: string = 'Mercadinho';
  @Input() showMenuButton: boolean = true;
  @Input() showBackButton: boolean = false;
  @Input() icon: string = 'bi-shop-window';
  @Input() themeClass: string = '';
  @Output() closeMenu = new EventEmitter<Event>();

  readonly unreadCount$ = this.notificationsFacade.unreadCount$;

  presentingElement: HTMLElement | null = null;

  ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
  }

  onCloseMenu(event: Event) {
    this.closeMenu.emit(event);
  }

  testNotification() {
    this.notificationsFacade.send({
      title: 'Alerta de Teste',
      body: 'Isso é uma simulação de notificação nativa!',
      type: 'system',
      priority: 'normal',
    });
  }
}
