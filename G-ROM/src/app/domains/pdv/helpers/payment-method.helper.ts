import type { PaymentMethod } from '@domains/pdv/types/pdv.types';

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'Pix',
  CREDITO: 'Crédito',
  DEBITO: 'Débito',
};

export const PAYMENT_ICONS: Record<PaymentMethod, string> = {
  DINHEIRO: 'bi-cash-stack',
  PIX: 'bi-qr-code',
  CREDITO: 'bi-credit-card-2-front',
  DEBITO: 'bi-credit-card',
};

export const PAYMENT_API_NAMES: Record<PaymentMethod, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'Pix',
  CREDITO: 'Cartao de Credito',
  DEBITO: 'Cartao de Debito',
};

export function getPaymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_LABELS[method];
}
