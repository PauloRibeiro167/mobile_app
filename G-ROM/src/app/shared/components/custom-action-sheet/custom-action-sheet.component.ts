import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton } from '@ionic/angular/standalone';

export interface ActionSheetButton {
  text: string;                    // Texto principal do botão
  icon?: string;                   // Nome do ícone Bootstrap (sem prefixo 'bi-')
  role?: string;                   // Role do botão (cancel, destructive, etc.)
  selected?: boolean;              // Indica se o botão está selecionado/ativo
  handler?: () => void;            // Função executada ao clicar
}

@Component({
  selector: 'app-custom-action-sheet',
  templateUrl: './custom-action-sheet.component.html',
  styleUrls: ['./custom-action-sheet.component.css'],
  standalone: true,
  imports: [CommonModule, IonButton]
})

export class CustomActionSheetComponent {
  @Input() isOpen: boolean = false;
  @Input() header: string = '';
  @Input() buttons: ActionSheetButton[] = [];
  
  @Output() didDismiss = new EventEmitter<any>();
  @Output() buttonClick = new EventEmitter<ActionSheetButton>();

  constructor() {}

  get safeButtons(): ActionSheetButton[] {
    return this.buttons || [];
  }

  get ariaLabel(): string {
    return this.header || 'Opções';
  }

  getButtonClasses(button: ActionSheetButton): string {
    const baseClasses = 'action-sheet-button mb-3 mx-auto flex-center';
    
    if (button.role === 'cancel') {
      return `${baseClasses} action-sheet-button--cancel text-fixed-white`;
    }
    
    if (button.selected) {
      return `${baseClasses} action-sheet-button--selected w-80`;
    }
    
    return `${baseClasses} w-80`;
  }

  handleButtonClick(button: ActionSheetButton) {
    this.buttonClick.emit(button);
    
    if (button.handler) {
      button.handler();
    }
    
    if (button.role !== 'keep-open') {
      this.onModalDismiss({ 
        role: button.role || 'button'
      });
    }
  }

  onModalDismiss(event: any) {
    this.isOpen = false;
    this.didDismiss.emit(event);
  }

  dismissFromBackdrop(): void {
    this.onModalDismiss({ role: 'backdrop' });
  }
}
