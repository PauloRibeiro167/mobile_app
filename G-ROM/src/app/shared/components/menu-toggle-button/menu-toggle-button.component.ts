import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonMenuButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-menu-toggle-button',
  standalone: true,
  imports: [CommonModule, IonMenuButton],
  templateUrl: './menu-toggle-button.component.html',
  styleUrl: './menu-toggle-button.component.css',
})
export class MenuToggleButtonComponent {
  @Input() mode: 'menu' | 'close' = 'menu';
  @Input() tone: 'brand' | 'neutral' = 'brand';
  @Input() compact = true;
  @Input() ariaLabel = 'Abrir menu';

  @Output() pressed = new EventEmitter<void>();

  get buttonClasses(): Record<string, boolean> {
    return {
      'menu-toggle': true,
      'menu-toggle--compact': this.compact,
      'menu-toggle--brand': this.tone === 'brand',
      'menu-toggle--neutral': this.tone === 'neutral',
      'menu-toggle--close': this.mode === 'close',
    };
  }

  handlePress(): void {
    this.pressed.emit();
  }
}
