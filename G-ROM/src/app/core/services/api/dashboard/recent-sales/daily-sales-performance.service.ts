import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import dailySalesPerformanceConfigJson from './daily-sales-performance-config.json';
import { DailySalesClosingPayload, DailySalesClosingSyncService } from './daily-sales-closing-sync.service';
import { RecentSalesDataService } from './recent-sales-data.service';

type MetricDirection = 'higher_is_better' | 'lower_is_better';
type MetricTone = 'danger' | 'info' | 'success';

interface MetricConfig {
  title: string;
  idealMin: number;
  idealMax: number;
  direction: MetricDirection;
}

type MetricsConfig = {
  salesCount: MetricConfig;
  salesValue: MetricConfig;
  promissoriaCount: MetricConfig;
};

export interface IndicadorMetricaDiaria {
  title: string;
  valorLabel: string;
  ajudaLabel: string;
  tom: MetricTone;
}

export interface DailySalesPerformanceSummary {
  quantidadeVendas: IndicadorMetricaDiaria;
  valorVendas: IndicadorMetricaDiaria;
  quantidadePromissorias: IndicadorMetricaDiaria;
}

export interface DailySalesSnapshot {
  dataOperacao: string;
  totalVendas: number;
  valorTotal: number;
  totalPromissorias: number;
}

@Injectable({
  providedIn: 'root',
})
export class DailySalesPerformanceService {
  private readonly recentSalesDataService = inject(RecentSalesDataService);
  private readonly dailySalesClosingSyncService = inject(DailySalesClosingSyncService);
  private readonly config = dailySalesPerformanceConfigJson as MetricsConfig;

  evaluate(snapshot: DailySalesSnapshot): DailySalesPerformanceSummary {
    return {
      quantidadeVendas: this.buildIndicator(
        this.config.salesCount,
        snapshot.totalVendas,
        String(snapshot.totalVendas)
      ),
      valorVendas: this.buildIndicator(
        this.config.salesValue,
        snapshot.valorTotal,
        this.formatCurrency(snapshot.valorTotal)
      ),
      quantidadePromissorias: this.buildIndicator(
        this.config.promissoriaCount,
        snapshot.totalPromissorias,
        String(snapshot.totalPromissorias)
      ),
    };
  }

  async closeBusinessDay(snapshot: DailySalesSnapshot): Promise<void> {
    const payload: DailySalesClosingPayload = {
      businessDate: snapshot.dataOperacao,
      totalSales: snapshot.totalVendas,
      totalValue: snapshot.valorTotal,
      promissoriaCount: snapshot.totalPromissorias,
    };

    await firstValueFrom(this.dailySalesClosingSyncService.submitDailyClosing(payload));
    await this.recentSalesDataService.resetDailySalesRecords();
  }

  private buildIndicator(
    config: MetricConfig,
    value: number,
    valueLabel: string
  ): IndicadorMetricaDiaria {
    const tone = this.resolveTone(config, value);

    return {
      title: config.title,
      valorLabel: valueLabel,
      ajudaLabel: this.getHelperLabel(config, tone),
      tom: tone,
    };
  }

  private resolveTone(config: MetricConfig, value: number): MetricTone {
    if (config.direction === 'higher_is_better') {
      if (value < config.idealMin) {
        return 'danger';
      }

      if (value <= config.idealMax) {
        return 'info';
      }

      return 'success';
    }

    if (value > config.idealMax) {
      return 'danger';
    }

    if (value <= config.idealMin) {
      return 'success';
    }

    return 'info';
  }

  private getHelperLabel(config: MetricConfig, tone: MetricTone): string {
    if (config.direction === 'higher_is_better') {
      if (tone === 'danger') {
        return 'Abaixo do esperado';
      }

      if (tone === 'info') {
        return 'Faixa ideal';
      }

      return 'Acima do esperado';
    }

    if (tone === 'danger') {
      return 'Acima do limite';
    }

    if (tone === 'info') {
      return 'Faixa de atenção';
    }

    return 'Sob controle';
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}
