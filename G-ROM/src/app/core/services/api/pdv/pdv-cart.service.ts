import { Injectable, inject } from '@angular/core';

import { CartItemView, CartSkuLine, ProductCatalogItem } from '../../../models/pdv.models';
import { PdvCatalogService } from './pdv-catalog.service';

@Injectable({
  providedIn: 'root',
})
export class PdvCartService {
  private readonly pdvCatalogService = inject(PdvCatalogService);

  private lines: CartSkuLine[] = [];

  get skuLines(): CartSkuLine[] {
    return [...this.lines];
  }

  get items(): CartItemView[] {
    return this.lines
      .map((line) => this.mapLineToView(line))
      .filter((item): item is CartItemView => item !== null);
  }

  get totalVenda(): number {
    return this.items.reduce((total, item) => total + item.subtotal, 0);
  }

  get totalItens(): number {
    return this.lines.reduce((total, line) => total + line.quantidade, 0);
  }

  addByBarcode(barcode: string): ProductCatalogItem | null {
    const product = this.pdvCatalogService.getByBarcode(barcode);

    if (!product) {
      return null;
    }

    this.addSku(product.sku, product.barcode);

    return product;
  }

  addSku(sku: string, barcode: string): void {
    const existingLine = this.lines.find((line) => line.sku === sku);

    if (existingLine) {
      existingLine.quantidade += 1;
      return;
    }

    this.lines = [{ sku, quantidade: 1, barcode }, ...this.lines];
  }

  updateQuantity(sku: string, delta: number): void {
    const line = this.lines.find((entry) => entry.sku === sku);

    if (!line) {
      return;
    }

    line.quantidade += delta;

    if (line.quantidade <= 0) {
      this.lines = this.lines.filter((entry) => entry.sku !== sku);
    }
  }

  clear(): void {
    this.lines = [];
  }

  private mapLineToView(line: CartSkuLine): CartItemView | null {
    const product = this.pdvCatalogService.getBySku(line.sku);

    if (!product) {
      return null;
    }

    return {
      sku: line.sku,
      nome: product.nome,
      preco: product.preco,
      quantidade: line.quantidade,
      barcode: line.barcode,
      subtotal: product.preco * line.quantidade,
    };
  }
}
