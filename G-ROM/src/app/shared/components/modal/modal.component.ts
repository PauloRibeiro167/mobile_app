import { Component, EventEmitter, Input, Output, AfterViewInit, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonButton } from '@ionic/angular/standalone';

export interface ModalConfig {
  title: string;
  message: string;
  icon?: string;
  confirmText?: string | null;
  cancelText?: string | null;
  isAlert?: boolean;
  confirmRoute?: string | null;
  cancelRoute?: string | null;
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  standalone: true,
  // Adicione IonButton aos imports do componente
  imports: [CommonModule, IonButton],
  host: {
    '[class.inline-modal]': 'isInline'
  }
})
export class ModalComponent implements OnInit {
  private router = inject(Router);

  @Input() title: string = 'Confirmação';
  @Input() message: string = 'Você tem certeza?';
  @Input() confirmText: string | null = 'Confirmar';
  @Input() cancelText: string | null = 'Cancelar';
  @Input() icon: string = 'help-circle-outline';
  @Input() confirmRoute: string | null = null;
  @Input() cancelRoute: string | null = null;
  @Input() isAlert: boolean = false;
  @Input() isInline: boolean = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();

  // Estado interno para modal inline
  public show: boolean = false;
  private currentConfig: ModalConfig | null = null;
  private onConfirmCallback?: () => void;
  private onCancelCallback?: () => void;

  constructor() {
  }

  ngOnInit() {
    if (this.isAlert) {
      if (!this.confirmText) this.confirmText = null;
      if (!this.cancelText) this.cancelText = 'Fechar';
    }
  }

  // Método para mostrar modal inline com configuração simples
  public showModal(config: ModalConfig, onConfirm?: () => void, onCancel?: () => void): void {
    this.currentConfig = config;
    this.title = config.title;
    this.message = config.message;
    this.icon = config.icon || 'help-circle-outline';
    this.confirmText = config.confirmText !== undefined ? config.confirmText : 'Confirmar';
    this.cancelText = config.cancelText !== undefined ? config.cancelText : 'Cancelar';
    this.isAlert = config.isAlert || false;
    this.confirmRoute = config.confirmRoute || null;
    this.cancelRoute = config.cancelRoute || null;

    this.onConfirmCallback = onConfirm;
    this.onCancelCallback = onCancel;
    this.show = true;
  }

  // Método para fechar modal
  public hideModal(): void {
    this.show = false;
    this.currentConfig = null;
    this.onConfirmCallback = undefined;
    this.onCancelCallback = undefined;
  }

  // Métodos helper para tipos comuns de modal
  public showAlert(title: string, message: string, icon: string = 'information-circle-outline', onClose?: () => void): void {
    this.showModal({
      title,
      message,
      icon,
      confirmText: null,
      cancelText: 'Fechar',
      isAlert: true
    }, onClose, onClose);
  }

  public showConfirm(title: string, message: string, icon: string = 'help-circle-outline', onConfirm?: () => void, onCancel?: () => void): void {
    this.showModal({
      title,
      message,
      icon,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      isAlert: false
    }, onConfirm, onCancel);
  }

  onConfirm() {
    if (this.onConfirmCallback) {
      this.onConfirmCallback();
    }
    this.confirmed.emit();
    if (this.confirmRoute) {
      this.router.navigate([this.confirmRoute]);
    }
    // Removido: modalCtrl.dismiss não é necessário para modais inline
    this.hideModal();
  }

  onCancel() {
    if (this.onCancelCallback) {
      this.onCancelCallback();
    }
    if (this.cancelText) {
      this.canceled.emit();
    }
    if (this.cancelRoute) {
      this.router.navigate([this.cancelRoute]);
    }
    // Removido: modalCtrl.dismiss não é necessário para modais inline
    this.hideModal();
  }

  getBootstrapIconClass(): string {
    const iconMap: { [key: string]: string } = {
      'help-circle-outline': 'bi bi-question-circle',
      'search-outline': 'bi bi-search',
      'warning-outline': 'bi bi-exclamation-triangle',
      'checkmark-circle-outline': 'bi bi-check-circle',
      'close-circle-outline': 'bi bi-x-circle',
      'information-circle-outline': 'bi bi-info-circle',
      'wifi-off': 'bi bi-wifi-off',
      'create': 'bi bi-pencil',
      'lock-closed': 'bi bi-lock',
      'log-out-outline': 'bi bi-box-arrow-right',
      'bi-search': 'bi bi-search',
      'bi-lightbulb': 'bi bi-lightbulb',
      'bi-person': 'bi bi-person',
      'bi-question-circle': 'bi bi-question-circle',
      'bi-building': 'bi bi-building',
      'bi-wifi-off': 'bi bi-wifi-off'
    };
    return iconMap[this.icon] || 'bi bi-question-circle';
  }
}
