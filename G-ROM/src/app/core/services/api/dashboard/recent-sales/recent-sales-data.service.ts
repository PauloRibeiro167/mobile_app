import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { PreferencesService } from '@services';
import { getBusinessDateFortaleza } from '../../../../utils/date.utils';

import recentSalesJson from './recent-sales.json';

export type RecentSalePaymentMethod =
  | 'PIX'
  | 'Crédito'
  | 'Débito'
  | 'Dinheiro'
  | 'Promissória';

export interface RecentSaleRecord {
  id: string;
  hora: string;
  valor: string;
  pagamento: RecentSalePaymentMethod;
  cliente: string;
  vencimentoPromissoria?: string;
  itens?: Array<{
    nome: string;
    quantidade: number;
    valorUnitario: string;
  }>;
}

interface RecentSalesDailyState {
  businessDate: string;
  records: RecentSaleRecord[];
}

interface RecentSalesHistoryState {
  records: RecentSaleRecord[];
}

@Injectable({
  providedIn: 'root',
})
export class RecentSalesDataService {
  private readonly maxRecentRecords = 10;
  private readonly preferencesService = inject(PreferencesService);
  private readonly dailyStateKey = 'recent-sales:daily-state';
  private readonly historyStateKey = 'recent-sales:history-state';
  private readonly refreshSubject = new BehaviorSubject<void>(undefined);

  getRecentSalesDailyRecords(): Observable<RecentSaleRecord[]> {
    return this.refreshSubject.pipe(
      switchMap(() => from(this.loadRecentSalesDailyRecords()))
    );
  }

  getRecentSalesRecords(): Observable<RecentSaleRecord[]> {
    return this.refreshSubject.pipe(
      switchMap(() => from(this.loadRecentSalesHistoryRecords()))
    );
  }

  refresh(): void {
    this.refreshSubject.next(undefined);
  }

  async registerRecentSale(record: RecentSaleRecord): Promise<void> {
    const businessDate = this.getBusinessDate();
    const dailyState =
      await this.preferencesService.getJson<RecentSalesDailyState | null>(
        this.dailyStateKey,
        null
      );
    const historyState =
      await this.preferencesService.getJson<RecentSalesHistoryState | null>(
        this.historyStateKey,
        null
      );

    const nextDailyRecords = this.limitRecentRecords([
      record,
      ...(dailyState?.businessDate === businessDate ? dailyState.records : []),
    ]);
    const nextHistoryRecords = this.limitRecentRecords([
      record,
      ...(historyState?.records ?? []),
    ]);

    await this.preferencesService.setJson<RecentSalesDailyState>(
      this.dailyStateKey,
      {
        businessDate,
        records: nextDailyRecords,
      }
    );
    await this.preferencesService.setJson<RecentSalesHistoryState>(
      this.historyStateKey,
      {
        records: nextHistoryRecords,
      }
    );
    this.refresh();
  }

  async resetDailySalesRecords(): Promise<void> {
    await this.preferencesService.setJson<RecentSalesDailyState>(
      this.dailyStateKey,
      {
        businessDate: this.getBusinessDate(),
        records: [],
      }
    );
    this.refresh();
  }

  private async loadRecentSalesDailyRecords(): Promise<RecentSaleRecord[]> {
    const businessDate = this.getBusinessDate();
    const seedRecords = recentSalesJson as RecentSaleRecord[];
    const state =
      await this.preferencesService.getJson<RecentSalesDailyState | null>(
        this.dailyStateKey,
        null
      );

    if (state?.businessDate === businessDate) {
      const normalizedRecords = this.normalizeRecords(state.records, seedRecords);

      if (this.hasRecordChanges(state.records, normalizedRecords)) {
        await this.preferencesService.setJson<RecentSalesDailyState>(
          this.dailyStateKey,
          {
            businessDate,
            records: normalizedRecords,
          }
        );
      }

      return normalizedRecords;
    }

    await this.preferencesService.setJson<RecentSalesDailyState>(
      this.dailyStateKey,
      {
        businessDate,
        records: seedRecords,
      }
    );

    return seedRecords;
  }

  private async loadRecentSalesHistoryRecords(): Promise<RecentSaleRecord[]> {
    const seedRecords = recentSalesJson as RecentSaleRecord[];
    const state =
      await this.preferencesService.getJson<RecentSalesHistoryState | null>(
        this.historyStateKey,
        null
      );

    if (state?.records?.length) {
      const normalizedRecords = this.limitRecentRecords(
        this.normalizeRecords(state.records, seedRecords)
      );

      if (this.hasRecordChanges(state.records, normalizedRecords)) {
        await this.preferencesService.setJson<RecentSalesHistoryState>(
          this.historyStateKey,
          {
            records: normalizedRecords,
          }
        );
      }

      return normalizedRecords;
    }

    const initialRecords = this.limitRecentRecords(seedRecords);

    await this.preferencesService.setJson<RecentSalesHistoryState>(
      this.historyStateKey,
      {
        records: initialRecords,
      }
    );

    return initialRecords;
  }

  private getBusinessDate(): string {
    return getBusinessDateFortaleza();
  }

  private normalizeRecords(
    records: RecentSaleRecord[],
    seedRecords: RecentSaleRecord[]
  ): RecentSaleRecord[] {
    const seedMap = new Map(seedRecords.map((record) => [record.id, record]));

    return records.map((record) => {
      const seedRecord = seedMap.get(record.id);

      if (!seedRecord) {
        return {
          ...record,
          itens: record.itens ?? [],
        };
      }

      return {
        ...seedRecord,
        ...record,
        vencimentoPromissoria:
          record.vencimentoPromissoria ?? seedRecord.vencimentoPromissoria,
        itens:
          record.itens && record.itens.length > 0
            ? record.itens
            : (seedRecord.itens ?? []),
      };
    });
  }

  private hasRecordChanges(
    previousRecords: RecentSaleRecord[],
    nextRecords: RecentSaleRecord[]
  ): boolean {
    return JSON.stringify(previousRecords) !== JSON.stringify(nextRecords);
  }

  private limitRecentRecords(records: RecentSaleRecord[]): RecentSaleRecord[] {
    const deduplicated = records.filter(
      (record, index, array) =>
        array.findIndex((current) => current.id === record.id) === index
    );

    return deduplicated.slice(0, this.maxRecentRecords);
  }
}
