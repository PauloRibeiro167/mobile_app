import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/angular/standalone';

import { PaymentMethod } from '@domains/pdv/types/pdv.types';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.css'],
})
export class PaymentModalComponent {
  @Input() totalVenda: number = 0;
  private modalCtrl = inject(ModalController);

  readonly methods: Array<{
    value: PaymentMethod;
    label: string;
    icon: string;
    description: string;
    containerClass: string;
    iconClass: string;
    tagClass: string;
  }> = [
    {
      value: 'DINHEIRO',
      label: 'Dinheiro',
      icon: 'bi-cash-stack',
      description: 'Recebimento imediato no caixa',
      containerClass: 'border-emerald-500/20 bg-emerald-500/8 active:border-emerald-400/35',
      iconClass: 'text-emerald-300',
      tagClass: 'text-emerald-200',
    },
    {
      value: 'PIX',
      label: 'PIX',
      icon: 'bi-qr-code',
      description: 'Pagamento instantaneo via chave ou QR Code',
      containerClass: 'border-sky-500/20 bg-sky-500/8 active:border-sky-400/35',
      iconClass: 'text-sky-300',
      tagClass: 'text-sky-200',
    },
    {
      value: 'CREDITO',
      label: 'Crédito',
      icon: 'bi-credit-card-2-front',
      description: 'Compra no credito com confirmacao na maquininha',
      containerClass: 'border-violet-500/20 bg-violet-500/8 active:border-violet-400/35',
      iconClass: 'text-violet-300',
      tagClass: 'text-violet-200',
    },
    {
      value: 'DEBITO',
      label: 'Débito',
      icon: 'bi-credit-card',
      description: 'Debito direto na conta do cliente',
      containerClass: 'border-amber-500/20 bg-amber-500/8 active:border-amber-400/35',
      iconClass: 'text-amber-300',
      tagClass: 'text-amber-200',
    },
  ];

  close() {
    this.modalCtrl.dismiss();
  }

  select(method: PaymentMethod) {
    this.modalCtrl.dismiss(method);
  }
}
