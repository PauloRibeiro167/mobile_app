import { Injectable, NgZone, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { SafeArea } from 'capacitor-plugin-safe-area';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface SafeAreaStatus {
  supported: boolean;
  insets: SafeAreaInsets;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SafeAreaService {
  private safeAreaSubject = new BehaviorSubject<SafeAreaStatus>({
    supported: false,
    insets: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  public safeArea$ = this.safeAreaSubject.asObservable();
  private lastAppliedInsets: SafeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  private readonly isNativePlatform = Capacitor.isNativePlatform();

  // Valores padrão para dispositivos sem suporte
  private readonly DEFAULT_INSETS: SafeAreaInsets = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  };

  // Valores estimados para dispositivos móveis comuns
  private readonly ESTIMATED_INSETS: Record<string, SafeAreaInsets> = {
    // Android com navegação por gestos (bottom pequeno)
    'android-gesture-nav': { top: 0, bottom: 0, left: 0, right: 0 },
    // Android com navegação padrão (3 botões - bottom maior)
    'android-3button-nav': { top: 0, bottom: 0, left: 0, right: 0 },
    // Android com notch e gesture navigation
    'android-notch-gesture': { top: 0, bottom: 0, left: 0, right: 0 },
    // Android com notch e navegação padrão
    'android-notch-3button': { top: 0, bottom: 0, left: 0, right: 0 },
    // Tablets ou dispositivos sem notch
    'tablet': { top: 0, bottom: 0, left: 0, right: 0 },
    // iOS (para referência futura)
    'ios': { top: 0, bottom: 0, left: 0, right: 0 }
  };

  private readonly ngZone = inject(NgZone);
  private readonly isAndroidEnvironment =
    Capacitor.getPlatform() === 'android' ||
    (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent));
  private readonly isChromeTestBrowser =
    !this.isNativePlatform &&
    typeof navigator !== 'undefined' &&
    /Android/i.test(navigator.userAgent) &&
    /Chrome|CriOS/i.test(navigator.userAgent);

  constructor() {
    this.initializeSafeArea();
    this.setupOrientationListener();
    this.setupAppStateListener();
  }

  private async initializeSafeArea(): Promise<void> {
    try {
      
      // Verifica se está rodando no Capacitor (dispositivo móvel)
      if (!this.isNativePlatform) {
        this.applyFallbackInsets();
        return;
      }

      // Pequeno delay para garantir que o dispositivo esteja pronto
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Tenta obter safe area do plugin
      await this.updateSafeArea();

      // Configura listeners para mudanças dinâmicas
      this.setupDynamicListeners();

    } catch (error) {
      console.warn('Safe Area plugin initialization failed:', error);
      // Fallback para valores estimados
      this.applyFallbackInsets();
    }
  }

  private setupOrientationListener(): void {
    // Escuta mudanças de orientação
    if (Capacitor.isPluginAvailable('ScreenOrientation')) {
      ScreenOrientation.addListener('screenOrientationChange', () => {
        setTimeout(() => {
          this.ngZone.run(() => {
            void this.updateSafeArea();
          });
        }, 300);
      });
    }
  }

  private setupAppStateListener(): void {
    if (Capacitor.isPluginAvailable('App')) {
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          setTimeout(() => {
            this.ngZone.run(() => {
              void this.updateSafeArea();
            });
          }, 250);
        }
      });
    }
  }

  private setupDynamicListeners(): void {
    if (Capacitor.isPluginAvailable('SafeArea') && typeof SafeArea.addListener === 'function') {
      void SafeArea.addListener('safeAreaChanged', ({ insets }) => {
        this.ngZone.run(() => {
          const normalizedInsets = this.computeNormalizedInsets(insets);
          this.updateSafeAreaStatus({
            supported: true,
            insets: normalizedInsets
          });
        });
      });
    }

    if (typeof window !== 'undefined') {
      const debouncedUpdate = this.debounce(() => {
        void this.updateSafeArea();
      }, 200);

      // Listener para mudanças de tamanho da viewport (rotação, teclado, etc.)
      window.addEventListener('resize', () => {
        this.ngZone.run(debouncedUpdate);
      });

      // Listener específico para mudanças de orientação
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          this.ngZone.run(() => {
            void this.updateSafeArea();
          });
        }, 400);
      });

      // Listener para visual viewport (teclado virtual, etc.)
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
          this.ngZone.run(debouncedUpdate);
        });
      }

      // Listener customizado para detectar mudanças na navegação Android
      this.setupNavigationChangeListener();
    }
  }

  /**
   * Configura listener para detectar mudanças no tipo de navegação Android
   */
  private setupNavigationChangeListener(): void {
    if (!this.isAndroidEnvironment || typeof window === 'undefined') {
      return;
    }

    let lastNavigationType: 'gesture' | '3button' | null = null;
    let lastViewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

    const checkNavigationChange = () => {
      const currentViewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
      const currentNavigationType = this.detectAndroidNavigationType();

      // Verifica se houve mudança significativa na altura da viewport
      // ou mudança no tipo de navegação detectado
      const heightChanged = Math.abs(currentViewportHeight - lastViewportHeight) > 50;
      const navigationChanged = currentNavigationType !== lastNavigationType;

      if (heightChanged || navigationChanged) {
          // Atualiza e força refresh dos insets
        lastNavigationType = currentNavigationType;
        lastViewportHeight = currentViewportHeight;

        setTimeout(() => {
          this.ngZone.run(() => {
            void this.updateSafeArea();
          });
        }, 300);
      }
    };

    // Verifica mudanças periodicamente (a cada 2 segundos)
    // Isso captura mudanças nas configurações do sistema
    setInterval(() => {
      this.ngZone.run(checkNavigationChange);
    }, 2000);

    // Também verifica em eventos específicos
    const events = ['focus', 'visibilitychange', 'pageshow'];
    events.forEach(event => {
      window.addEventListener(event, () => {
        setTimeout(() => {
          this.ngZone.run(checkNavigationChange);
        }, 500);
      });
    });
  }

  private debounce(func: Function, wait: number): () => void {
    let timeout: any;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(), wait);
    };
  }

  public async updateSafeArea(): Promise<void> {
    try {      
      if (!Capacitor.isPluginAvailable('SafeArea')) {
        console.warn('⚠️ [SafeArea] Plugin SafeArea não disponível - aplicando valores padrão');
        this.applyFallbackInsets();
        return;
      }

      const result = await SafeArea.getSafeAreaInsets();

      const normalizedInsets = this.computeNormalizedInsets(result?.insets);

      this.updateSafeAreaStatus({
        supported: true,
        insets: normalizedInsets
      });

    } catch (error) {
      console.warn('❌ [SafeArea] Falha ao obter safe area insets:', error);
      this.applyFallbackInsets(error);
    }
  }

  private applyFallbackInsets(error?: any): void {
    const fallbackInsets = this.computeNormalizedInsets();

    this.updateSafeAreaStatus({
      supported: false,
      insets: fallbackInsets,
      error: error ? String(error) : 'Safe area not supported'
    });
  }

  private getEstimatedInsets(): SafeAreaInsets {
    if (!this.isNativePlatform) {
      return this.DEFAULT_INSETS;
    }

    const platform = Capacitor.getPlatform();
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const screenHeight = typeof screen !== 'undefined' ? screen.height : viewportHeight;
    const screenWidth = typeof screen !== 'undefined' ? screen.width : viewportWidth;
    const devicePixelRatio = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

    if (platform === 'android') {
      const navigationType = this.detectAndroidNavigationType();
      const hasNotch = this.detectNotch();

      if (hasNotch) {
        if (navigationType === 'gesture') {
          return this.ESTIMATED_INSETS['android-notch-gesture'];
        } else {
          return this.ESTIMATED_INSETS['android-notch-3button'];
        }
      } else {
        if (navigationType === 'gesture') {
          return this.ESTIMATED_INSETS['android-gesture-nav'];
        } else {
          return this.ESTIMATED_INSETS['android-3button-nav'];
        }
      }
    }

    return this.ESTIMATED_INSETS['tablet'];
  }

  /**
   * Detecta o tipo de navegação no Android
   * - 'gesture': Navegação por gestos (bottom inset pequeno)
   * - '3button': Navegação padrão com 3 botões (bottom inset maior)
   */
  private detectAndroidNavigationType(): 'gesture' | '3button' {
    if (typeof window === 'undefined') {
      return '3button'; // fallback conservador
    }

    const viewportHeight = window.innerHeight;
    const screenHeight = screen.height;
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Ajusta para densidade de pixels
    const adjustedViewportHeight = viewportHeight * devicePixelRatio;
    const adjustedScreenHeight = screenHeight;

    // Diferença entre altura da tela e viewport
    const heightDifference = adjustedScreenHeight - adjustedViewportHeight;

    // Heurísticas para detectar tipo de navegação:
    // - Navegação por gestos: diferença pequena (status bar + pequena margem)
    // - Navegação 3 botões: diferença maior (status bar + navigation bar)

    // Thresholds baseados em pixels físicos (não lógicos)
    const GESTURE_THRESHOLD_MAX = 120; // ~30dp em densidade média
    const BUTTON_NAV_MIN = 140; // ~48dp+ para navigation bar

    if (heightDifference < GESTURE_THRESHOLD_MAX) {
      return 'gesture';
    } else if (heightDifference >= BUTTON_NAV_MIN) {
      return '3button';
    } else {
      // Zona cinza - usa heurísticas adicionais

      // Verifica se há insets CSS já definidos (pode indicar gesture nav)
      const hasExistingInsets = this.hasExistingSafeAreaInsets();

      // Dispositivos mais recentes tendem a ter gesture navigation
      const isModernDevice = this.isModernAndroidDevice();

      if (hasExistingInsets && isModernDevice) {
        return 'gesture';
      } else {
        return '3button';
      }
    }
  }

  /**
   * Verifica se há insets de safe area já definidos no CSS
   */
  private hasExistingSafeAreaInsets(): boolean {
    if (typeof document === 'undefined') {
      return false;
    }

    try {
      const computed = getComputedStyle(document.documentElement);
      const top = parseInt(computed.getPropertyValue('--safe-area-top') || '0', 10);
      const bottom = parseInt(computed.getPropertyValue('--safe-area-bottom') || '0', 10);

      return (top > 0 || bottom > 0);
    } catch {
      return false;
    }
  }

  /**
   * Heurística para detectar dispositivos Android modernos
   */
  private isModernAndroidDevice(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }

    // Verifica user agent para Android versão
    const userAgent = navigator.userAgent;
    const androidVersion = this.extractAndroidVersion(userAgent);

    // Android 10+ tende a ter gesture navigation por padrão
    return androidVersion >= 10;
  }

  /**
   * Extrai versão do Android do user agent
   */
  private extractAndroidVersion(userAgent: string): number {
    const androidMatch = userAgent.match(/Android\s+(\d+)/i);
    if (androidMatch) {
      return parseInt(androidMatch[1], 10);
    }

    // Fallback para versões mais antigas
    if (userAgent.includes('Android 9')) return 9;
    if (userAgent.includes('Android 8')) return 8;
    if (userAgent.includes('Android 7')) return 7;

    return 0; // Desconhecido
  }

  /**
   * Detecta se o dispositivo tem notch ou câmera frontal
   */
  private detectNotch(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const screenHeight = screen.height;
    const screenWidth = screen.width;
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Calcula aspect ratio
    const aspectRatio = Math.max(viewportWidth, viewportHeight) / Math.min(viewportWidth, viewportHeight);

    // Dispositivos com notch geralmente têm:
    // - Aspect ratio alto (>2.0 para muitos modernos)
    // - Diferença significativa entre screen e viewport na parte superior

    const isTallDevice = aspectRatio > 2.0;
    const hasTopInset = this.hasTopSafeAreaInset();

    return isTallDevice && hasTopInset;
  }

  /**
   * Verifica se há inset superior (notch/status bar)
   */
  private hasTopSafeAreaInset(): boolean {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return false;
    }

    try {
      // Verifica se já temos insets definidos
      const computed = getComputedStyle(document.documentElement);
      const topInset = parseInt(computed.getPropertyValue('--safe-area-top') || '0', 10);

      if (topInset > 20) { // Mais de 20px indica notch
        return true;
      }

      // Heurística: dispositivos com altura de tela muito maior que viewport
      const viewportHeight = window.innerHeight;
      const screenHeight = screen.height;
      const difference = screenHeight - viewportHeight;

      // Se a diferença for significativa na parte superior, pode ser notch
      return difference > 100; // Threshold arbitrário

    } catch {
      return false;
    }
  }

  private updateSafeAreaStatus(status: SafeAreaStatus): void {
    const insets = { ...status.insets };
    const hasInsetsChanged = this.haveInsetsChanged(this.lastAppliedInsets, insets);
    const shouldEmit = hasInsetsChanged ||
      this.safeAreaSubject.value.supported !== status.supported ||
      this.safeAreaSubject.value.error !== status.error;

    if (hasInsetsChanged) {
      this.lastAppliedInsets = insets;
      this.setCSSVariables(insets);
    }

    if (shouldEmit) {
      this.safeAreaSubject.next({
        supported: status.supported,
        insets,
        error: status.error
      });
    }
  }

  private setCSSVariables(insets: SafeAreaInsets): void {
    if (typeof document === 'undefined') {
      return;
    }

    const browserChromeBottomGap = this.computeBottomBrowserGap(insets);

    const targets: Array<HTMLElement | null> = [document.body, document.documentElement];
    targets.forEach(target => {
      if (!target) {
        return;
      }

      target.style.setProperty('--ion-safe-area-top', `${insets.top}px`);
      target.style.setProperty('--ion-safe-area-bottom', `${insets.bottom}px`);
      target.style.setProperty('--ion-safe-area-left', `${insets.left}px`);
      target.style.setProperty('--ion-safe-area-right', `${insets.right}px`);

      target.style.setProperty('--safe-area-top', `${insets.top}px`);
      target.style.setProperty('--safe-area-bottom', `${insets.bottom}px`);
      target.style.setProperty('--safe-area-left', `${insets.left}px`);
      target.style.setProperty('--safe-area-right', `${insets.right}px`);

      target.style.setProperty('--app-safe-area-top', `${insets.top}px`);
      target.style.setProperty('--app-safe-area-bottom', `${insets.bottom}px`);
      target.style.setProperty('--app-safe-area-left', `${insets.left}px`);
      target.style.setProperty('--app-safe-area-right', `${insets.right}px`);
      target.style.setProperty('--app-browser-chrome-bottom-gap', `${browserChromeBottomGap}px`);
    });

    if (document.body) {
      document.body.dataset['safeAreaTop'] = `${insets.top}`;
      document.body.dataset['safeAreaBottom'] = `${insets.bottom}`;
      document.body.dataset['safeAreaLeft'] = `${insets.left}`;
      document.body.dataset['safeAreaRight'] = `${insets.right}`;
    }
  }

  private computeBottomBrowserGap(insets: SafeAreaInsets): number {
    if (this.isChromeTestBrowser) {
      return this.computeChromeAndroidTestGap(insets);
    }

    return this.computeGenericAndroidBrowserGap(insets);
  }

  private computeChromeAndroidTestGap(insets: SafeAreaInsets): number {
    if (typeof window === 'undefined') {
      return 0;
    }

    const navigationType = this.detectAndroidNavigationType();
    const viewportMetrics = this.getViewportMetrics();
    const browserUiLoss = Math.max(0, viewportMetrics.screenHeightCss - viewportMetrics.visualViewportHeight);

    // Em Chrome Android de teste, a barra inferior costuma não entrar como safe area real.
    // Mantemos um piso por tipo de navegação e somamos uma fração da perda real da viewport.
    const minimumGap = navigationType === 'gesture' ? 20 : 44;
    const inferredGap = Math.min(Math.max(browserUiLoss * 0.45, 0), 40);
    const safeAreaContribution = insets.bottom > 0 ? Math.max(0, minimumGap - insets.bottom) : minimumGap;

    return Math.round(safeAreaContribution + inferredGap);
  }

  private computeGenericAndroidBrowserGap(insets: SafeAreaInsets): number {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return 0;
    }

    const isBrowser = !this.isNativePlatform;
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (!isBrowser || !isAndroid) {
      return 0;
    }

    const navigationType = this.detectAndroidNavigationType();
    const viewportMetrics = this.getViewportMetrics();
    const viewportLossPx = Math.max(
      0,
      Math.round(viewportMetrics.screenHeightCss - viewportMetrics.visualViewportHeight)
    );

    const baseGap = navigationType === 'gesture' ? 16 : 40;
    const inferredGap = Math.min(Math.max(viewportLossPx * 0.35, 0), 36);
    const safeAreaCompensation = insets.bottom > 0 ? 0 : baseGap;

    return Math.round(safeAreaCompensation + inferredGap);
  }

  private getViewportMetrics(): {
    visualViewportHeight: number;
    innerHeight: number;
    screenHeightCss: number;
  } {
    const innerHeight = window.innerHeight;
    const visualViewportHeight = window.visualViewport?.height ?? innerHeight;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const rawScreenHeight = window.screen?.height ?? innerHeight;

    return {
      visualViewportHeight,
      innerHeight,
      screenHeightCss: rawScreenHeight / devicePixelRatio,
    };
  }

  private computeNormalizedInsets(rawInsets?: Partial<SafeAreaInsets> | null): SafeAreaInsets {
    const sanitized = this.sanitizeInsets(rawInsets);
    const envInsets = this.getEnvInsets();
    const estimated = this.getEstimatedInsets();

    const merged = this.mergeInsets(sanitized, envInsets, estimated);
    return this.normalizeInsets(merged);
  }

  private sanitizeInsets(insets?: Partial<SafeAreaInsets> | null): SafeAreaInsets {
    const parse = (value: unknown): number => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    };

    if (!insets) {
      return { ...this.DEFAULT_INSETS };
    }

    return {
      top: parse(insets.top),
      bottom: parse(insets.bottom),
      left: parse(insets.left),
      right: parse(insets.right)
    };
  }

  private getEnvInsets(): SafeAreaInsets {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return { ...this.DEFAULT_INSETS };
    }

    try {
      const computed = getComputedStyle(document.documentElement);
      const parse = (value: string): number => {
        const normalized = value?.trim() || '0';
        const numeric = Number(normalized.replace('px', ''));
        return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
      };

      return {
        top: parse(computed.getPropertyValue('--safe-area-top')),
        bottom: parse(computed.getPropertyValue('--safe-area-bottom')),
        left: parse(computed.getPropertyValue('--safe-area-left')),
        right: parse(computed.getPropertyValue('--safe-area-right'))
      };
    } catch (error) {
      console.warn('⚠️ [SafeArea] Falha ao obter variáveis CSS de fallback:', error);
      return { ...this.DEFAULT_INSETS };
    }
  }

  private mergeInsets(...sources: SafeAreaInsets[]): SafeAreaInsets {
    return sources.reduce<SafeAreaInsets>((acc, current) => ({
      top: Math.max(acc.top, current?.top ?? 0),
      bottom: Math.max(acc.bottom, current?.bottom ?? 0),
      left: Math.max(acc.left, current?.left ?? 0),
      right: Math.max(acc.right, current?.right ?? 0)
    }), { ...this.DEFAULT_INSETS });
  }

  private normalizeInsets(insets: SafeAreaInsets): SafeAreaInsets {
    const constrained = this.applyPlatformConstraints(insets);
    const round = (value: number) => {
      if (!Number.isFinite(value)) {
        return 0;
      }
      return Math.max(0, Math.round(value));
    };

    return {
      top: round(constrained.top),
      bottom: round(constrained.bottom),
      left: round(constrained.left),
      right: round(constrained.right)
    };
  }

  private applyPlatformConstraints(insets: SafeAreaInsets): SafeAreaInsets {
    const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);
    const platform = Capacitor.getPlatform();

    if (platform === 'android') {
      return {
        top: clamp(insets.top, 120),
        bottom: clamp(insets.bottom, 120),
        left: clamp(insets.left, 40),
        right: clamp(insets.right, 40)
      };
    }

    return {
      top: clamp(insets.top, 140),
      bottom: clamp(insets.bottom, 140),
      left: clamp(insets.left, 60),
      right: clamp(insets.right, 60)
    };
  }

  private haveInsetsChanged(prev: SafeAreaInsets, next: SafeAreaInsets): boolean {
    return prev.top !== next.top ||
      prev.bottom !== next.bottom ||
      prev.left !== next.left ||
      prev.right !== next.right;
  }

  public getCurrentSafeArea(): SafeAreaStatus {
    return this.safeAreaSubject.value;
  }

  public getInsets(): SafeAreaInsets {
    return this.safeAreaSubject.value.insets;
  }

  public isSupported(): boolean {
    return this.safeAreaSubject.value.supported;
  }

  // Método para forçar atualização manual
  public refresh(): Promise<void> {
    return this.updateSafeArea();
  }

  /**
   * Força re-detecção do tipo de navegação Android e atualização dos insets
   * Útil quando o usuário muda as configurações de navegação do sistema
   */
  public async refreshNavigationDetection(): Promise<void> {
    if (!this.isNativePlatform || Capacitor.getPlatform() !== 'android') {
      return;
    }

    // Limpa cache de detecção
    this.clearDetectionCache();

    // Força atualização completa
    await this.updateSafeArea();

  }

  /**
   * Limpa cache interno de detecção para forçar nova análise
   */
  private clearDetectionCache(): void {
    // Este método pode ser expandido se adicionarmos mais cache no futuro
  }

  /**
   * Retorna informações de debug sobre a detecção atual
   */
  public getDebugInfo(): any {
    if (!this.isNativePlatform) {
      return { platform: 'web', navigationType: 'n/a' };
    }

    const platform = Capacitor.getPlatform();
    const navigationType = platform === 'android' ? this.detectAndroidNavigationType() : 'n/a';
    const hasNotch = this.detectNotch();
    const currentInsets = this.getCurrentSafeArea();

    return {
      platform,
      navigationType,
      hasNotch,
      currentInsets,
      viewport: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : null,
      screen: typeof screen !== 'undefined' ? {
        width: screen.width,
        height: screen.height
      } : null,
      devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : null
    };
  }

  // Observable para mudanças específicas
  public getInsetsObservable(): Observable<SafeAreaInsets> {
    return this.safeArea$.pipe(
      map(status => status.insets),
      debounceTime(100)
    );
  }
}
