import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pdv-product-reader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdv-product-reader.component.html',
})
export class PdvProductReaderComponent {
  @Input() manualBarcode = '';
  @Input() cartIsEmpty = true;

  @Output() manualBarcodeChange = new EventEmitter<string>();
  @Output() addManual = new EventEmitter<void>();
  @Output() startScan = new EventEmitter<void>();
  @Output() testScan = new EventEmitter<void>();

  updateManualBarcode(value: string): void {
    this.manualBarcodeChange.emit(value);
  }
}
