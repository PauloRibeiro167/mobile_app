import { VendaRecenteViewModel } from '@services/api/dashboard/recent-sales/models/recent-sales.models';

export function trackByVenda(_: number, venda: VendaRecenteViewModel): string {
  return venda.id;
}

export function obterClasseBadgePagamento(
  tom: VendaRecenteViewModel['tomPagamento']
): string {
  switch (tom) {
    case 'emerald':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';
    case 'sky':
      return 'border-sky-400/20 bg-sky-400/10 text-sky-200';
    case 'amber':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200';
    case 'violet':
      return 'border-violet-400/20 bg-violet-400/10 text-violet-200';
    default:
      return 'border-white/10 bg-white/5 text-zinc-200';
  }
}

export function obterClasseTituloPagamento(
  tom: VendaRecenteViewModel['tomPagamento']
): string {
  switch (tom) {
    case 'emerald':
      return 'text-emerald-300';
    case 'sky':
      return 'text-sky-300';
    case 'amber':
      return 'text-amber-300';
    case 'violet':
      return 'text-violet-300';
    default:
      return 'text-zinc-300';
  }
}

export function obterClasseLinhaPagamento(
  tom: VendaRecenteViewModel['tomPagamento']
): string {
  switch (tom) {
    case 'emerald':
      return 'via-emerald-400/35';
    case 'sky':
      return 'via-sky-400/35';
    case 'amber':
      return 'via-amber-400/35';
    case 'violet':
      return 'via-violet-400/35';
    default:
      return 'via-zinc-400/20';
  }
}

export function obterIconePagamento(
  metodo: VendaRecenteViewModel['pagamentoLabel']
): string {
  switch (metodo) {
    case 'PIX':
      return 'bi-qr-code';
    case 'Crédito':
    case 'Débito':
      return 'bi-credit-card-2-front';
    case 'Promissória':
      return 'bi-journal-text';
    default:
      return 'bi-cash-stack';
  }
}
