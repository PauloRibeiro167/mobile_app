import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonTabBar, IonTabButton } from '@ionic/angular/standalone';
import { PdvAccessOrigin, PdvAccessService } from '@domains/pdv/services/pdv-access.service';
import { OpenRegisterModalComponent } from '../open-register-modal/open-register-modal.component';

@Component({
  selector: 'app-bottom-tab-bar',
  templateUrl: './bottom-tab-bar.component.html',
  styleUrls: ['./bottom-tab-bar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonTabBar,
    IonTabButton,
    OpenRegisterModalComponent,
  ],
})
export class BottomTabBarComponent {
  private router = inject(Router);
  private readonly pdvAccessService = inject(PdvAccessService);

  @Input() themeClass: string = '';
  isOpenRegisterModalOpen = false;
  modalOrigin: PdvAccessOrigin = 'bottom-tab-bar';

  get currentUrl(): string {
    return this.router.url;
  }

  tabs = [
    {
      tab: 'home',
      routerLink: '/home',
      icon: 'bi-grid',
      label: 'Dashboard',
    },
    {
      tab: 'pdv',
      routerLink: '/pdv',
      icon: 'bi-calculator',
      label: 'PDV',
    },
    {
      tab: 'historico',
      routerLink: '/historico',
      icon: 'bi-clock-history',
      label: 'Histórico',
    },
    {
      tab: 'estoque',
      routerLink: '/estoque',
      icon: 'bi-box-seam',
      label: 'Estoque',
    },
  ];

  // Função para verificar se a tab está ativa
  isActiveTab(tabRoute: string): boolean {
    const cleanCurrentUrl = this.currentUrl.split('?')[0].replace(/\/+$/, '');
    const cleanTabRoute = tabRoute.replace(/\/+$/, '');
    return cleanCurrentUrl === cleanTabRoute;
  }

  // Função trackBy para melhor performance no *ngFor
  trackByTab(index: number, tab: any): string {
    return tab.tab;
  }

  get isDarkMode(): boolean {
    return this.themeClass === 'dark';
  }

  async handleTabClick(
    event: Event,
    tab: (typeof this.tabs)[number]
  ): Promise<void> {
    event.preventDefault();

    if (tab.tab === 'pdv') {
      const access = await this.pdvAccessService.requestPdvAccess(
        'bottom-tab-bar'
      );

      if (access.status === 'requires-opening') {
        this.modalOrigin = access.draft.origem;
        this.isOpenRegisterModalOpen = true;
        return;
      }
    }

    if (!this.isActiveTab(tab.routerLink)) {
      await this.router.navigate([tab.routerLink]);
    }
  }

  handleOpenRegisterClosed(): void {
    this.isOpenRegisterModalOpen = false;
  }

  async handleRegisterOpened(): Promise<void> {
    this.isOpenRegisterModalOpen = false;

    if (!this.isActiveTab('/pdv')) {
      await this.router.navigate(['/pdv']);
    }
  }
}
