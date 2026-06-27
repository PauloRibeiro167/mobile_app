import { CommonModule } from '@angular/common';
import { IonicModule, RefresherCustomEvent, } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BottomTabBarComponent, HeaderComponent, MenuComponent, RefresherComponent, } from '@components';
import { buildAppLayoutClass } from '@utils';
import { ThemeService, SafeAreaService, AppInitializationService, DataMigrationService, AppLifecycleService, NavigationService, PageInfo, AuthService, } from '@services';
import { Subscription } from 'rxjs';
import { lineWobble } from 'ldrs';

if (!customElements.get('l-line-wobble')) {
  lineWobble.register();
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  standalone: true,
  imports: [ CommonModule, IonicModule, RouterModule, FormsModule, HeaderComponent, BottomTabBarComponent, MenuComponent, RefresherComponent, ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly chromeHiddenRoutes = ['/login'];
  private themeService = inject(ThemeService);
  private safeAreaService = inject(SafeAreaService);
  private appInitializationService = inject(AppInitializationService);
  private dataMigrationService = inject(DataMigrationService);
  private appLifecycleService = inject(AppLifecycleService);
  private navigationService = inject(NavigationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  private subscriptions = new Subscription();

  // Observable para o título e ícone atuais
  currentPage$ = this.navigationService.currentPage$;

  // Propriedade para armazenar o valor atual da página
  private currentPageValue: PageInfo = {
    title: 'Início',
    icon: 'bi-house-fill',
  };
  private currentUrl = '';
  isAuthenticated = false;
  isRefreshing = false;

  // Propriedades computadas para isolar a lógica do template
  get headerTitle(): string {
    return this.currentPageValue?.title || 'Início';
  }

  get headerIcon(): string {
    return this.currentPageValue?.icon || 'bi-house-fill';
  }

  // Propriedade computada para a classe do tema
  get themeClass(): string {
    return this.themeService.updateThemeClass();
  }

  // Classe de layout principal do app shell
  get appShellClass(): string {
    return buildAppLayoutClass(this.currentPageValue?.title, this.themeClass);
  }

  get showAuthenticatedChrome(): boolean {
    return this.isAuthenticated && !this.isChromeHiddenRoute(this.currentUrl);
  }

  private isChromeHiddenRoute(url: string): boolean {
    const normalizedUrl = (url || '/')
      .split('?')[0]
      .split('#')[0]
      .replace(/\/+$/, '') || '/';

    return this.chromeHiddenRoutes.some((route) => normalizedUrl === route);
  }

  async ngOnInit() {
    // Inicialização da app delegada ao serviço
    await this.appInitializationService.initializeApp();
    await this.authService.initialize();

    // Inscreve para atualizar o valor atual da página
    this.subscriptions.add(
      this.currentPage$.subscribe((page) => {
        this.currentPageValue = page;
      })
    );

    this.currentUrl = this.router.url;
    this.isAuthenticated = this.authService.isAuthenticated();

    this.subscriptions.add(
      this.authService.usuarioLogado$.subscribe((usuario) => {
        this.isAuthenticated = !!usuario;
      })
    );

    this.subscriptions.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = event.urlAfterRedirects;
        }
      })
    );

    // Reaplica o tema após reload no mobile
    await this.themeService.applyTheme();

    // Força atualização da safe area após inicialização
    setTimeout(() => {
      this.safeAreaService.refresh();

      // Remove classe de debug após 5 segundos
      setTimeout(() => {
        const appElement = document.querySelector('ion-app');
        if (appElement) {
          appElement.classList.remove('debug-safe-area');
        }
      }, 5000);
    }, 500);

    // Configura listeners dinâmicos (resize, tema do dispositivo)
    this.appLifecycleService.setupDynamicListeners();

    // Migração de dados (única responsabilidade)
    this.dataMigrationService.migrateIfNeeded();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  handleRefresh(event: RefresherCustomEvent) {
    this.isRefreshing = true;
    // Simule uma operação de atualização.
    // Substitua isso pela sua lógica de atualização de dados real.
    setTimeout(() => {
      event.target.complete();
      this.isRefreshing = false;
    }, 2000);
  }
}
