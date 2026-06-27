import { Injectable, inject } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { parseCurrencyValue } from '../../../../utils/currency.utils';
import { getBusinessDateFortaleza } from '../../../../utils/date.utils';
import { DailySalesPerformanceService } from './daily-sales-performance.service';
import { RecentSalesDataService } from './recent-sales-data.service';
import {
  buildPainelVendasRecentesViewModel,
  toVendaRecenteViewModel,
} from './mappers/recent-sales.mapper';
import { PainelVendasRecentesViewModel } from './models/recent-sales.models';

@Injectable({
  providedIn: 'root',
})
export class RecentSalesService {
  private readonly recentSalesDataService = inject(RecentSalesDataService);
  private readonly dailySalesPerformanceService = inject(
    DailySalesPerformanceService
  );

  getRecentSalesPanel(): Observable<PainelVendasRecentesViewModel> {
    return combineLatest([
      this.recentSalesDataService.getRecentSalesRecords(),
      this.recentSalesDataService.getRecentSalesDailyRecords(),
    ]).pipe(
      map(([historySales, dailySales]) => {
        const vendasMapeadas = historySales.map(toVendaRecenteViewModel);
        const valorTotal = dailySales.reduce(
          (soma, venda) => soma + parseCurrencyValue(venda.valor),
          0
        );
        const totalPromissorias = dailySales.filter(
          (venda) => venda.pagamento === 'Promissória'
        ).length;
        const dataOperacao = getBusinessDateFortaleza();
        const indicadores = this.dailySalesPerformanceService.evaluate({
          dataOperacao,
          totalVendas: dailySales.length,
          valorTotal,
          totalPromissorias,
        });

        return buildPainelVendasRecentesViewModel({
          vendasRecentes: vendasMapeadas,
          totalVendas: dailySales.length,
          valorTotal,
          ultimaHoraLabel: historySales[0]?.hora ?? '--:--',
          totalPromissorias,
          dataOperacao,
          indicadores,
        });
      })
    );
  }
}
