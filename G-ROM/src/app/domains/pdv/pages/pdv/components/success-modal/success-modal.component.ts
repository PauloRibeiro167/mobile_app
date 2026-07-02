import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, IonContent } from '@ionic/angular/standalone';

import { getPaymentMethodLabel } from '@domains/pdv/helpers/payment-method.helper';
import { PaymentMethod } from '@domains/pdv/types/pdv.types';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule, IonContent],
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.css'],
})
export class SuccessModalComponent {
  @Input() totalVenda: number = 0;
  @Input() method: PaymentMethod = 'PIX';
  private modalCtrl = inject(ModalController);

  get paymentLabel(): string {
    return getPaymentMethodLabel(this.method);
  }

  get paymentIconClass(): string {
    return this.method === 'PIX' ? 'bi bi-qr-code' : 'bi bi-check2-circle';
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
