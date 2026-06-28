import { Injectable } from '@angular/core';

export interface CartItem {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  barcode: string;
}

export interface CanceledSale {
  timestamp: Date;
  items: CartItem[];
  total: number;
  reason: string;
}

interface MockProduct {
  nome: string;
  preco: number;
}

@Injectable({
  providedIn: 'root',
})
export class PdvStore {
  private readonly mockProducts: MockProduct[] = [
    { nome: 'Arroz Tio João 5kg', preco: 29.9 },
    { nome: 'Feijão Carioca 1kg', preco: 8.5 },
    { nome: 'Óleo de Soja 900ml', preco: 6.75 },
    { nome: 'Açúcar Refinado 1kg', preco: 4.2 },
    { nome: 'Café Melitta 500g', preco: 18.9 },
  ];

  cartItems: CartItem[] = [];
  totalVenda = 0;
  canceledSales: CanceledSale[] = [];

  processBarcode(barcode: string): void {
    const randomProduct =
      this.mockProducts[Math.floor(Math.random() * this.mockProducts.length)];

    this.addItemToCart({
      id: Date.now(),
      nome: randomProduct.nome,
      preco: randomProduct.preco,
      quantidade: 1,
      barcode,
    });
  }

  addItemToCart(item: CartItem): void {
    const existingIndex = this.cartItems.findIndex(
      (cartItem) => cartItem.barcode === item.barcode
    );

    if (existingIndex > -1) {
      this.cartItems[existingIndex].quantidade += 1;
    } else {
      this.cartItems.unshift(item);
    }

    this.calculateTotal();
  }

  updateQty(index: number, delta: number): void {
    const item = this.cartItems[index];

    if (!item) {
      return;
    }

    item.quantidade += delta;

    if (item.quantidade <= 0) {
      this.cartItems.splice(index, 1);
    }

    this.calculateTotal();
  }

  clearCart(): void {
    this.cartItems = [];
    this.calculateTotal();
  }

  recordCanceledSale(reason: string): void {
    const canceledSale: CanceledSale = {
      timestamp: new Date(),
      items: [...this.cartItems],
      total: this.totalVenda,
      reason,
    };

    this.canceledSales.push(canceledSale);

    console.warn('⚠️ VENDA CANCELADA REGISTRADA:', {
      motivo: reason,
      valorPerdido: this.totalVenda,
      itens: this.cartItems.length,
    });
  }

  completeSuccessfulSale(): void {
    this.clearCart();
  }

  private calculateTotal(): void {
    this.totalVenda = this.cartItems.reduce(
      (accumulator, item) => accumulator + item.preco * item.quantidade,
      0
    );
  }
}
