import { Injectable, inject } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { PreferencesService } from '../../infraestrutura/preferences.service';

type ThemeAppData = {
  theme?: string;
} & Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'appData';
  private platform = inject(Platform);
  private preferencesService = inject(PreferencesService);

  // Observable para notificar mudanças na definição de tema do usuário (null se usando dispositivo)
  private themeSubject = new BehaviorSubject<string | null>(null);
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    void this.initializeTheme();
  }

  private async initializeTheme(): Promise<void> {
    const appData = await this.getAppData();
    const savedTheme = appData.theme;

    let themeToApply: string;

    if (savedTheme && savedTheme !== '') {
      // Usa a definição do usuário se existir
      themeToApply = savedTheme;
      this.themeSubject.next(savedTheme); // Emite a definição do usuário
    } else {
      // Usa as preferências do dispositivo se não houver definição
      themeToApply = this.getDeviceTheme();
      this.themeSubject.next(null); // Emite null para indicar uso do dispositivo
    }

    if (themeToApply === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  toggleTheme(): void {
    const isDark = document.body.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    // Estratégia específica para mobile
    const applyTheme = () => {
      if (isDark) {
        document.body.classList.remove('dark');
      } else {
        document.body.classList.add('dark');
      }
    };

    // Verifica se é mobile (incluindo emuladores)
    const isMobile = this.platform?.is('mobile') || this.platform?.is('android') || this.platform?.is('ios') ||
                     this.isRunningInEmulator() || this.isRunningInWebView();

    if (isMobile) {
      setTimeout(() => {
        applyTheme();
        // Força múltiplas técnicas de re-rendering
        this.forceMobileRerender();
        // Emite mudança de tema
        this.themeSubject.next(newTheme);
        // Reload para garantir mudança no app
        setTimeout(() => {
          window.location.reload();
        }, 200);
      }, 150);
    } else {
      applyTheme();
      this.themeSubject.next(newTheme);
    }

    void this.saveThemeToStorage(newTheme);
  }

  // Método para recarregar tema do dispositivo (usado quando apagar definição)
  async reloadTheme(): Promise<void> {
    const appData = await this.getAppData();
    delete appData.theme; // Remove a definição de tema
    await this.preferencesService.setJson(this.THEME_KEY, appData);

    // Recarrega o tema do dispositivo
    const deviceTheme = this.getDeviceTheme();
    if (deviceTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    this.themeSubject.next(null); // Emite null para indicar uso do dispositivo

    // Se for mobile, reload para aplicar
    const isMobile = this.platform?.is('mobile') || this.platform?.is('android') || this.platform?.is('ios') ||
                     this.isRunningInEmulator() || this.isRunningInWebView();
    if (isMobile) {
      setTimeout(() => {
        window.location.reload();
      }, 200);
    }
  }

  // Método para reaplicar o tema (usado após reload no mobile)
  async applyTheme(): Promise<void> {
    const appData = await this.getAppData();
    const savedTheme = appData.theme;

    let themeToApply: string;

    if (savedTheme && savedTheme !== '') {
      themeToApply = savedTheme;
      this.themeSubject.next(savedTheme); // Emite a definição do usuário
    } else {
      themeToApply = this.getDeviceTheme();
      this.themeSubject.next(null); // Emite null para indicar uso do dispositivo
    }

    if (themeToApply === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  isDarkMode(): boolean {
    const isDark = document.body.classList.contains('dark');
    return isDark;
  }

  // Método para obter a classe CSS do tema atual
  updateThemeClass(): string {
    return this.isDarkMode() ? 'dark' : '';
  }

  // Método para obter o tema atual aplicado
  getCurrentTheme(): string {
    return document.body.classList.contains('dark') ? 'dark' : 'light';
  }

  private forceMobileRerender(): void {
    // Força re-rendering no mobile através de manipulação do DOM
    if (this.platform?.is('mobile') || this.isRunningInEmulator() || this.isRunningInWebView()) {
      const body = document.body;
      const originalDisplay = body.style.display;

      // Técnica 1: Trigger reflow
      body.style.display = 'none';
      body.offsetHeight; // Trigger reflow
      body.style.display = originalDisplay || '';

      // Técnica 2: Force repaint com transform
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.requestAnimationFrame) {
          window.requestAnimationFrame(() => {
            body.style.transform = 'translateZ(0)';
            body.style.willChange = 'transform';

            setTimeout(() => {
              body.style.transform = '';
              body.style.willChange = '';
            }, 50);
          });
        }
      }, 10);

      // Técnica 3: Dispatch custom event para notificar componentes
      setTimeout(() => {
        const themeChangeEvent = new CustomEvent('themeChanged', {
          detail: { theme: document.body.classList.contains('dark') ? 'dark' : 'light' }
        });
        window.dispatchEvent(themeChangeEvent);
      }, 100);
    }
  }

  private isRunningInEmulator(): boolean {
    // Detecta se está rodando em emulador
    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      return userAgent.includes('emulator') ||
             userAgent.includes('simulator') ||
             userAgent.includes('chrome devtools') ||
             userAgent.includes('mobile safari') && userAgent.includes('version');
    }
    return false;
  }

  private isRunningInWebView(): boolean {
    // Detecta se está rodando em WebView/Capacitor
    if (typeof window !== 'undefined') {
      return !!(window as any).Capacitor ||
             !!(window as any).webkit?.messageHandlers ||
             navigator.userAgent.includes('wv') ||
             /Android.*Version\/[\d.]+/.test(navigator.userAgent);
    }
    return false;
  }

  private getDeviceTheme(): string {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery.matches ? 'dark' : 'light';
    }
    return 'light'; // Padrão se não conseguir detectar
  }

  private async getAppData(): Promise<ThemeAppData> {
    return this.preferencesService.getJson<ThemeAppData>(this.THEME_KEY, {});
  }

  private async saveThemeToStorage(theme: string): Promise<void> {
    const appData = await this.getAppData();
    appData.theme = theme;
    await this.preferencesService.setJson(this.THEME_KEY, appData);
  }
}
