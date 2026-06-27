import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PaymentMethod } from '../../../../core/models/pdv.models';

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

@Component({
  selector: 'app-pdv-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdv-footer.component.html',
})
export class PdvFooterComponent {
  @Input() paymentMethod: PaymentMethod | null = null;
  @Input() totalVenda = 0;
  @Input() totalItens = 0;
  @Input() canConclude = false;
  @Input() isSubmitting = false;

  @Output() choosePayment = new EventEmitter<void>();
  @Output() concludeSale = new EventEmitter<void>();

  readonly methodLabels = PAYMENT_LABELS;
  readonly methodIcons = PAYMENT_ICONS;

  get paymentLabel(): string {
    return this.paymentMethod ? PAYMENT_LABELS[this.paymentMethod] : 'Escolher pagamento';
  }

  get paymentIcon(): string {
    return this.paymentMethod ? PAYMENT_ICONS[this.paymentMethod] : 'bi-wallet2';
  }
}
