import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, RefresherCustomEvent, } from '@ionic/angular';
import { lineWobble } from 'ldrs';
import { addIcons } from 'ionicons';
import { calculatorOutline, barcodeOutline, lockClosedOutline, trendingUpOutline,cartOutline,alertCircleOutline,receiptOutline} from 'ionicons/icons';
import { DashboardService, DashboardData } from '../../core/services/api/dashboard/dashboard.service';
import { RegisterSessionService } from '@services/api';
import { RecentSalesDataService } from '@services/api/dashboard/recent-sales/recent-sales-data.service';
import { UserService, UserProfile } from '@services/api/user/user.service';
import { HeaderComponent } from "./components/header/header.component";
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { Observable, firstValueFrom } from 'rxjs';
import { TabelaUltimasVendasComponent } from "./components/tabela-ultimas-vendas/tabela-ultimas-vendas.component"
import { MetaDeVendasComponent } from './components/meta-de-vendas/meta-de-vendas.component';

if (!customElements.get('l-line-wobble')) {
  lineWobble.register();
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.css'],
  standalone: true,
  imports: [IonicModule, CommonModule, HeaderComponent, TabelaUltimasVendasComponent, QuickActionsComponent, MetaDeVendasComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
  
export class HomePage implements OnInit {
  private readonly introCardsSessionKey = 'dashboard:intro-cards-visible';
  private readonly refresherMinimumDurationMs = 900;
  private readonly dashboardService = inject(DashboardService);
  private readonly userService = inject(UserService);
  private readonly recentSalesDataService = inject(RecentSalesDataService);
  private readonly registerSessionService = inject(RegisterSessionService);

  dashboardData?: DashboardData;
  showIntroCards = true;
  userProfile$!: Observable<UserProfile>;
  isRefreshing = false;
  showRefresherPreview = true;

  constructor() {
    addIcons({
      calculatorOutline,
      barcodeOutline,
      lockClosedOutline,
      trendingUpOutline,
      cartOutline,
      alertCircleOutline,
      receiptOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.showIntroCards = sessionStorage.getItem(this.introCardsSessionKey) !== 'false';
    this.userProfile$ = this.userService.getUserProfile();
    await this.loadDashboardData();
    await this.registerSessionService.initialize();
  }

  hideIntroCardsForSession(): void {
    this.showIntroCards = false;
    sessionStorage.setItem(this.introCardsSessionKey, 'false');
  }

  async handleRefresh(event: RefresherCustomEvent): Promise<void> {
    this.isRefreshing = true;
    const refreshStartedAt = Date.now();

    try {
      await Promise.all([
        this.loadDashboardData(),
        this.registerSessionService.initialize(),
      ]);
      this.recentSalesDataService.refresh();
    } finally {
      const elapsed = Date.now() - refreshStartedAt;
      const remaining = Math.max(
        this.refresherMinimumDurationMs - elapsed,
        0
      );

      if (remaining > 0) {
        await this.wait(remaining);
      }

      this.isRefreshing = false;
      event.target.complete();
    }
  }

  private async loadDashboardData(): Promise<void> {
    this.dashboardData = await firstValueFrom(
      this.dashboardService.getDashboardData()
    );
  }

  private wait(durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, durationMs);
    });
  }

}
