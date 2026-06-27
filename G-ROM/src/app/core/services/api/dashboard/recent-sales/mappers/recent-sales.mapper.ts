import {
  formatCurrencyBRL,
  parseCurrencyValue,
} from '../../../../../utils/currency.utils';
import { formatMonthDayBR } from '../../../../../utils/date.utils';
import { RecentSalePaymentMethod, RecentSaleRecord } from '../recent-sales-data.service';
import {
  PainelVendasRecentesIndicadoresViewModel,
  PainelVendasRecentesViewModel,
  VendaRecentePagamentoTom,
  VendaRecenteViewModel,
} from '../models/recent-sales.models';

export function toVendaRecenteViewModel(
  venda: RecentSaleRecord
): VendaRecenteViewModel {
  const itens = venda.itens ?? [];
  const quantidadeItens = itens.reduce(
    (total, item) => total + item.quantidade,
    0
  );

  return {
    id: venda.id,
    clienteLabel: venda.cliente,
    horaLabel: venda.hora.trim(),
    valorLabel: formatCurrencyBRL(parseCurrencyValue(venda.valor)),
    quantidadeItensLabel: `${quantidadeItens} item${quantidadeItens !== 1 ? 's' : ''}`,
    pagamentoLabel: venda.pagamento,
    pagamentoMetaLabel:
      venda.pagamento === 'Promissória' && venda.vencimentoPromissoria
        ? `Prevista para ${formatMonthDayBR(venda.vencimentoPromissoria)}`
        : undefined,
    tomPagamento: getPaymentTone(venda.pagamento),
    itens: itens.map((item) => ({
      nome: item.nome,
      quantidade: item.quantidade,
      valorUnitarioLabel: formatCurrencyBRL(
        parseCurrencyValue(item.valorUnitario)
      ),
      subtotalLabel: formatCurrencyBRL(
        parseCurrencyValue(item.valorUnitario) * item.quantidade
      ),
    })),
  };
}

export function buildPainelVendasRecentesViewModel(params: {
  vendasRecentes: VendaRecenteViewModel[];
  totalVendas: number;
  valorTotal: number;
  totalPromissorias: number;
  dataOperacao: string;
  ultimaHoraLabel: string;
  indicadores: PainelVendasRecentesIndicadoresViewModel;
}): PainelVendasRecentesViewModel {
  return {
    vendas: params.vendasRecentes,
    totalVendas: params.totalVendas,
    valorTotal: params.valorTotal,
    valorTotalLabel: formatCurrencyBRL(params.valorTotal),
    ultimaHoraLabel: params.ultimaHoraLabel,
    totalPromissorias: params.totalPromissorias,
    dataOperacao: params.dataOperacao,
    indicadores: params.indicadores,
  };
}

export function getPaymentTone(
  payment: RecentSalePaymentMethod
): VendaRecentePagamentoTom {
  switch (payment) {
    case 'PIX':
      return 'emerald';
    case 'Crédito':
      return 'sky';
    case 'Débito':
      return 'amber';
    case 'Promissória':
      return 'violet';
    default:
      return 'zinc';
  }
}
