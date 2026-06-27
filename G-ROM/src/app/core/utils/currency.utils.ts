export function parseCurrencyValue(value: string): number {
  return Number(value.replace(/\./g, '').replace(',', '.'));
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
