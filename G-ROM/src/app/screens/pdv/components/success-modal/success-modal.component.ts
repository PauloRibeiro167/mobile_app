import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, IonContent } from '@ionic/angular/standalone';

import { PaymentMethod } from '../../../../core/models/pdv.models';

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
    const labels: Record<PaymentMethod, string> = {
      DINHEIRO: 'Dinheiro',
      PIX: 'Pix',
      CREDITO: 'Crédito',
      DEBITO: 'Débito',
    };

    return labels[this.method];
  }

  get paymentIconClass(): string {
    return this.method === 'PIX' ? 'bi bi-qr-code' : 'bi bi-check2-circle';
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
