import { IndicadorMetricaDiaria } from '../daily-sales-performance.service';
import { RecentSalePaymentMethod } from '../recent-sales-data.service';

export type VendaRecentePagamentoTom =
  | 'emerald'
  | 'sky'
  | 'amber'
  | 'zinc'
  | 'violet';

export interface VendaRecenteItemViewModel {
  nome: string;
  quantidade: number;
  valorUnitarioLabel: string;
  subtotalLabel: string;
}

export interface VendaRecenteViewModel {
  id: string;
  clienteLabel: string;
  horaLabel: string;
  valorLabel: string;
  quantidadeItensLabel: string;
  pagamentoLabel: RecentSalePaymentMethod;
  pagamentoMetaLabel?: string;
  tomPagamento: VendaRecentePagamentoTom;
  itens: VendaRecenteItemViewModel[];
}

export interface PainelVendasRecentesIndicadoresViewModel {
  quantidadeVendas: IndicadorMetricaDiaria;
  valorVendas: IndicadorMetricaDiaria;
  quantidadePromissorias: IndicadorMetricaDiaria;
}

export interface PainelVendasRecentesViewModel {
  vendas: VendaRecenteViewModel[];
  totalVendas: number;
  valorTotal: number;
  valorTotalLabel: string;
  ultimaHoraLabel: string;
  totalPromissorias: number;
  dataOperacao: string;
  indicadores: PainelVendasRecentesIndicadoresViewModel;
}
