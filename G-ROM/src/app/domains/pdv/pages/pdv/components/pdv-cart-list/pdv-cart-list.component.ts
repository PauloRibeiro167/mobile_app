import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CartItemView } from '@domains/pdv/types/pdv.types';

@Component({
  selector: 'app-pdv-cart-list',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './pdv-cart-list.component.html',
})
export class PdvCartListComponent {
  @Input() items: CartItemView[] = [];

  @Output() clearCart = new EventEmitter<void>();
  @Output() updateQuantity = new EventEmitter<{
    sku: string;
    delta: number;
  }>();
}
