import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonMenuButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-menu-toggle-button',
  standalone: true,
  imports: [CommonModule, IonMenuButton],
  templateUrl: './menu-toggle-button.component.html',
})
export class MenuToggleButtonComponent {
  @Input() mode: 'menu' | 'close' = 'menu';
  @Input() tone: 'brand' | 'neutral' = 'brand';
  @Input() compact = true;
  @Input() ariaLabel = 'Abrir menu';

  @Output() pressed = new EventEmitter<void>();

  get menuButtonClasses(): string[] {
    return [
      'group',
      'inline-flex',
      'shrink-0',
      'm-0',
      'cursor-pointer',
      'rounded-[14px]',
      '[--background:transparent]',
      '[--border-radius:14px]',
      '[--box-shadow:none]',
      '[--color:transparent]',
      '[--padding-bottom:0]',
      '[--padding-end:0]',
      '[--padding-start:0]',
      '[--padding-top:0]',
    ];
  }

  get menuSurfaceClasses(): string[] {
    return [
      'flex',
      this.compact ? 'h-9' : 'h-9',
      this.compact ? 'w-9' : 'w-9',
      'items-center',
      'justify-center',
      'rounded-lg',
      'border',
      this.tone === 'brand'
        ? 'border-[rgba(var(--app-color-primary-rgb),0.12)]'
        : 'border-white/10',
      'backdrop-blur-[14px]',
      'transition-all',
      'duration-200',
      'ease-out',
      'group-hover:-translate-y-0.5',
      'group-hover:border-[rgba(var(--app-color-primary-rgb),0.22)]',
      'group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_14px_24px_rgba(6,10,16,0.28)]',
      'group-focus-visible:-translate-y-0.5',
      'group-focus-visible:border-[rgba(var(--app-color-primary-rgb),0.22)]',
      'group-focus-visible:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_14px_24px_rgba(6,10,16,0.28)]',
      'group-active:scale-95',
    ];
  }

  get menuBarClasses(): string[] {
    return [
      'block',
      'h-0.5',
      'rounded-full',
      'bg-[var(--app-color-primary)]',
      'shadow-[0_0.5px_2px_rgba(0,0,0,0.18)]',
      'transition-all',
      'duration-200',
      'ease-out',
    ];
  }

  get closeButtonClasses(): string[] {
    return [
      'group',
      'inline-flex',
      'h-9',
      'w-9',
      'shrink-0',
      'items-center',
      'justify-center',
      'rounded-xl',
      'border',
      'border-gray-900/90',
      'bg-gray-200',
      'shadow-[0_8px_18px_rgba(15,23,42,0.16)]',
      'transition-all',
      'duration-200',
      'ease-out',
      'hover:-translate-y-0.5',
      'hover:border-[var(--app-color-primary)]',
      'hover:bg-[var(--app-color-primary)]',
      'hover:shadow-[0_12px_24px_rgba(15,23,42,0.22)]',
      'focus-visible:-translate-y-0.5',
      'focus-visible:border-[var(--app-color-primary)]',
      'focus-visible:bg-[var(--app-color-primary)]',
      'focus-visible:shadow-[0_12px_24px_rgba(15,23,42,0.22)]',
      'active:scale-95',
    ];
  }

  get closeIconClasses(): string[] {
    return [
      'bi',
      'bi-x',
      'block',
      'text-lg',
      'leading-none',
      'text-gray-900',
      'transition-colors',
      'duration-200',
      'ease-out',
      'group-hover:text-white',
      'group-focus-visible:text-white',
    ];
  }

  handlePress(): void {
    this.pressed.emit();
  }
}
