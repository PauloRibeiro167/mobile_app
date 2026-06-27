import { Injectable, inject } from '@angular/core';

import { AuthService } from '@services';
import { CartItemView, ConfirmedSale, PaymentMethod } from '../../../models/pdv.models';
import { PdvCartService } from './pdv-cart.service';

@Injectable({
  providedIn: 'root',
})
export class PdvCheckoutService {
  private readonly authService = inject(AuthService);
  private readonly pdvCartService = inject(PdvCartService);

  private selectedPaymentMethod: PaymentMethod | null = null;

  get paymentMethod(): PaymentMethod | null {
    return this.selectedPaymentMethod;
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
  }

  clearPaymentMethod(): void {
    this.selectedPaymentMethod = null;
  }

  canConcludeSale(): boolean {
    return this.pdvCartService.items.length > 0 && !!this.selectedPaymentMethod;
  }

  buildConfirmedSale(): ConfirmedSale {
    if (!this.selectedPaymentMethod) {
      throw new Error('Selecione a forma de pagamento antes de concluir a venda.');
    }

    const items = this.pdvCartService.items;

    if (items.length === 0) {
      throw new Error('Adicione produtos antes de concluir a venda.');
    }

    return {
      operadorId: this.authService.getUsuarioLogado()?.email ?? 'operador-demo',
      formaPagamento: this.selectedPaymentMethod,
      valorTotal: this.pdvCartService.totalVenda,
      totalItens: this.pdvCartService.totalItens,
      itens: items.map((item: CartItemView) => ({
        sku: item.sku,
        nome: item.nome,
        barcode: item.barcode,
        quantidade: item.quantidade,
        precoUnitario: item.preco,
        subtotal: item.subtotal,
      })),
      dataHoraConfirmacao: new Date().toISOString(),
    };
  }

  finalizeLocalState(): void {
    this.pdvCartService.clear();
    this.clearPaymentMethod();
  }
}
