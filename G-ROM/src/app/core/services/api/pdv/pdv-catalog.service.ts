import { Injectable } from '@angular/core';

import { ProductCatalogItem } from '../../../models/pdv.models';

@Injectable({
  providedIn: 'root',
})
export class PdvCatalogService {
  private readonly products: ProductCatalogItem[] = [
    {
      sku: 'SKU-ARROZ-5KG',
      nome: 'Arroz Tio João 5kg',
      preco: 29.9,
      barcode: '7891234567890',
    },
    {
      sku: 'SKU-FEIJAO-1KG',
      nome: 'Feijão Carioca 1kg',
      preco: 8.5,
      barcode: '7895556667778',
    },
    {
      sku: 'SKU-OLEO-900ML',
      nome: 'Óleo de Soja 900ml',
      preco: 6.75,
      barcode: '7899990001112',
    },
    {
      sku: 'SKU-ACUCAR-1KG',
      nome: 'Açúcar Refinado 1kg',
      preco: 4.2,
      barcode: '7891112223334',
    },
    {
      sku: 'SKU-CAFE-500G',
      nome: 'Café Melitta 500g',
      preco: 18.9,
      barcode: '7894445556667',
    },
  ];

  getByBarcode(barcode: string): ProductCatalogItem | null {
    return (
      this.products.find((product) => product.barcode === barcode.trim()) ?? null
    );
  }

  getBySku(sku: string): ProductCatalogItem | null {
    return this.products.find((product) => product.sku === sku) ?? null;
  }

  getSampleBarcodes(): string[] {
    return this.products.map((product) => product.barcode);
  }
}
