import { Injectable, inject } from '@angular/core';

import { PreferencesService } from '@services';

export type RecentSalesViewMode = 'table' | 'cards' | 'grid';

@Injectable({
  providedIn: 'root',
})
export class RecentSalesViewPreferencesService {
  private readonly preferencesService = inject(PreferencesService);
  private readonly chavePreferencia = 'dashboard:recent-sales:view-mode';
  private readonly modoPadrao: RecentSalesViewMode = 'cards';
  private readonly modosValidos: readonly RecentSalesViewMode[] = [
    'table',
    'cards',
    'grid',
  ];

  async getViewMode(): Promise<RecentSalesViewMode> {
    const modoSalvo = await this.preferencesService.getString(this.chavePreferencia);

    if (this.isModoValido(modoSalvo)) {
      return modoSalvo;
    }

    // Compatibilidade com a preferência antiga.
    if (modoSalvo === 'list') {
      return this.modoPadrao;
    }

    return this.modoPadrao;
  }

  async setViewMode(mode: RecentSalesViewMode): Promise<void> {
    await this.preferencesService.setString(this.chavePreferencia, mode);
  }

  private isModoValido(
    modo: string | null
  ): modo is RecentSalesViewMode {
    return !!modo && this.modosValidos.includes(modo as RecentSalesViewMode);
  }
}
