import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PAYMENT_ICONS, PAYMENT_LABELS } from '@domains/pdv/helpers/payment-method.helper';
import { PaymentMethod } from '@domains/pdv/models/pdv.models';

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
