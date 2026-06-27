export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO';

export interface ProductCatalogItem {
  sku: string;
  nome: string;
  preco: number;
  barcode: string;
}

export interface CartSkuLine {
  sku: string;
  quantidade: number;
  barcode: string;
}

export interface CartItemView {
  sku: string;
  nome: string;
  preco: number;
  quantidade: number;
  barcode: string;
  subtotal: number;
}

export interface ConfirmedSaleItem {
  sku: string;
  nome: string;
  barcode: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface ConfirmedSale {
  operadorId: string;
  formaPagamento: PaymentMethod;
  valorTotal: number;
  totalItens: number;
  itens: ConfirmedSaleItem[];
  dataHoraConfirmacao: string;
}

export interface FinalizedSalePayload {
  operadorId: string;
  formaPagamento: PaymentMethod;
  valorTotal: number;
  totalItens: number;
  itens: Array<{
    sku: string;
    quantidade: number;
  }>;
  dataHoraVenda: string;
}

export interface FinalizedSaleResponse {
  status: 'sucesso';
  vendaId: string;
  payloadRecebido: FinalizedSalePayload;
  servidor?: PdvVendaServerResponse;
}

export interface PdvMetodoPagamentoServer {
  id: number;
  nome: string;
}

export interface PdvVendaServerPayload {
  data_venda: string;
  metodo_pagamento_id: number;
  status: string;
  subtotal: number;
  valor_total: number;
  valor_pago: number;
  troco: number;
  numero_parcelas: number;
}

export interface PdvVendaServerRequest {
  venda: PdvVendaServerPayload;
}

export interface PdvVendaServerResponse {
  id?: number | string;
  numero_venda?: number | string;
  status?: string;
  subtotal?: number;
  valor_total?: number;
  data_venda?: string;
  [key: string]: unknown;
}
