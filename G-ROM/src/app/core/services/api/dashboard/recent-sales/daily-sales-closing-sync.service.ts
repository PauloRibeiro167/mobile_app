import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import dailySalesClosingResponseJson from './daily-sales-closing-response.json';

export interface DailySalesClosingPayload {
  businessDate: string;
  totalSales: number;
  totalValue: number;
  promissoriaCount: number;
}

export interface DailySalesClosingResponse {
  status: string;
  message: string;
  protocol: string;
}

@Injectable({
  providedIn: 'root',
})
export class DailySalesClosingSyncService {
  submitDailyClosing(
    _payload: DailySalesClosingPayload
  ): Observable<DailySalesClosingResponse> {
    return of({
      status: dailySalesClosingResponseJson.status,
      message: dailySalesClosingResponseJson.message,
      protocol: `${dailySalesClosingResponseJson.protocolPrefix}-${Date.now()}`,
    }).pipe(delay(180));
  }
}
