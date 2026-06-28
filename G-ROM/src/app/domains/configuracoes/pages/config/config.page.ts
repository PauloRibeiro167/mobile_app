import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonContent, IonButton} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline } from 'ionicons/icons';
import { ThemeService, PreferencesService } from '@services';
import { ToggleComponent } from '@components';
import { Subscription } from 'rxjs';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ToggleComponent, IonContent],
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.css'],
})

export class ConfigPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private alertController = inject(AlertController);
  private themeService = inject(ThemeService);
  private preferencesService = inject(PreferencesService);

  notificacoesAtivas = true;
  private themeSubscription?: Subscription;

  // Novas propriedades para tema do dispositivo e atual
  deviceTheme: string = 'light'; // 'light' ou 'dark'
  currentTheme: string = 'light'; // Tema atual do app

  // Propriedades para logs
  logStorage: string = '';
  logApplied: string = '';
  logObservable: string = '';

  constructor() {
    addIcons({ chevronForwardOutline });
  }

  ngOnInit(): void {
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.forceViewUpdate();
      this.updateCurrentTheme(theme);
      this.logObservable = `Observable: ${theme}`;
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('themeChanged', (event: any) => {
        this.forceViewUpdate();
      });
    }

    // Detecta o tema do dispositivo
    this.detectDeviceTheme();
    // O tema atual é atualizado pelo subscribe (BehaviorSubject emite o valor atual)
    void this.updateLogs();

    // Log device info to console
    // this.logDeviceInfo();
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('themeChanged', this.forceViewUpdate.bind(this));
    }
  }

  private forceViewUpdate(): void {
    const element = document.querySelector('app-config') as HTMLElement;
    if (element) {
      element.style.display = 'none';
      element.offsetHeight; 
      element.style.display = '';

      setTimeout(() => {
        if (typeof window !== 'undefined' && window.requestAnimationFrame) {
          window.requestAnimationFrame(() => {
            element.style.transform = 'translateZ(0)';
            setTimeout(() => {
              element.style.transform = '';
            }, 10);
          });
        }
      }, 10);
    }
  }

  get modoEscuro(): boolean {
    return this.themeService.isDarkMode();
  }

  // Novo método para detectar tema do dispositivo
  private detectDeviceTheme(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.deviceTheme = mediaQuery.matches ? 'dark' : 'light';
    }
  }

  // Novo método para atualizar o tema atual
  private updateCurrentTheme(userTheme?: string | null): void {
    if (userTheme !== undefined && userTheme !== null) {
      this.currentTheme = userTheme;
    } else {
      // Se não há definição do usuário, usa o tema aplicado (que é do dispositivo)
      this.currentTheme = this.themeService.getCurrentTheme();
    }
  }

  // Método para atualizar logs
  private async updateLogs(): Promise<void> {
    try {
      const appData = await this.preferencesService.getString('appData');
      this.logStorage = `Preferences.appData: ${appData || 'null'}`;
      this.logApplied = `Tema aplicado (body): ${this.themeService.getCurrentTheme()}`;
    } catch (error) {
      this.logStorage = 'Erro ao ler Preferences';
      this.logApplied = 'Erro';
    }
  }

  // Novo método para apagar definição de tema
  async clearTheme(): Promise<void> {
    await this.themeService.reloadTheme();
    await this.updateLogs();
  }

  async acessarOpcao(opcao: string) {
    let url: string;

    switch (opcao) {
      case 'consulta':
        url = 'https://sitfor.sefin.fortaleza.ce.gov.br/usuarios/sign_in';
        break;
      case 'upload':
        url = 'https://sitfor.sefin.fortaleza.ce.gov.br/usuarios/sign_in';
        break;
      case 'ajuda':
        url = 'https://sitfor.sefin.fortaleza.ce.gov.br/usuarios/sign_in';
        break;
      default:
        return;
    }

    await Browser.open({ url });
  }

  handleToggle(type: 'notificacoes' | 'modoEscuro', checked: boolean) {
    switch (type) {
      case 'notificacoes':
        this.notificacoesAtivas = checked;
        break;
      case 'modoEscuro':
        this.themeService.toggleTheme();
        void this.updateLogs();
        break;
    }
  }

  getIconClass(type: 'notificacoes' | 'modoEscuro'): string {
    switch (type) {
      case 'notificacoes':
        return this.notificacoesAtivas
          ? 'bi bi-bell-fill text-warning'
          : 'bi bi-bell-fill text-secondary';
      case 'modoEscuro':
        return this.modoEscuro
          ? 'bi bi-moon-stars-fill text-warning'
          : 'bi bi-sun-fill text-secondary';
      default:
        return '';
    }
  }

  // async logDeviceInfo() {
  //   try {
  //     const info = await Device.getInfo();
  //     console.log('Informações do dispositivo:', info);
  //   } catch (error) {
  //     console.error('Erro ao obter informações do dispositivo:', error);
  //   }
  // }

  getLabelClass(type: 'notificacoes' | 'modoEscuro'): string {
    const baseClasses = 'text-h4 font-semibold';
    const isActive = type === 'notificacoes' ? this.notificacoesAtivas : this.modoEscuro;
    const colorClass = isActive ? 'text-primary' : 'text-secondary';
    return `${baseClasses} ${colorClass}`;
  }
}
