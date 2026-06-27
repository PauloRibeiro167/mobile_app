import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { IonicModule, RefresherCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-refresher',
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './refresher.component.html',
  host: {
    'class': 'block w-full z-[99]'
  }
})
export class RefresherComponent implements OnDestroy {
  private readonly successDisplayDurationMs = 1500;
  private readonly closeAnimationBufferMs = 550;
  private _status: 'idle' | 'refreshing' | 'success' | 'error' = 'idle';
  private pendingEvent?: RefresherCustomEvent;
  private successTimerId?: number;
  private resetTimerId?: number;
  private onlineHandler?: () => void;

  @Input() isRefreshing = false;
  isVisible = false;
  
  @Input()
  set status(value: 'idle' | 'refreshing' | 'success' | 'error') {
    const oldValue = this._status;
    this._status = value;
    if (oldValue !== value) {
      this.handleStatusChange(value);
    }
  }

  get status(): 'idle' | 'refreshing' | 'success' | 'error' {
    return this._status;
  }

  @Output() ionRefresh = new EventEmitter<RefresherCustomEvent>();

  handlePullStart(): void {
    this.clearPendingTimers();
    this.isVisible = true;

    if (this.status !== 'refreshing') {
      this.status = 'idle';
    }
  }

  handleRefresh(event: RefresherCustomEvent): void {
    this.clearPendingTimers();
    this.pendingEvent = event;
    this.isVisible = true;
    this.status = 'refreshing';

    // Intercepta a conexão de internet
    if (!navigator.onLine) {
      this.status = 'error';
      this.handleStatusChange('error');
      return;
    }

    // Cria um proxy para interceptar a conclusão (complete) e exibir o estado de sucesso suavemente
    const customEvent = {
      ...event,
      target: {
        ...event.target,
        complete: () => {
          this.status = 'success';
        }
      }
    } as unknown as RefresherCustomEvent;

    this.ionRefresh.emit(customEvent);
  }

  private handleStatusChange(value: 'idle' | 'refreshing' | 'success' | 'error') {
    if (value === 'success') {
      // Mantem o estado de sucesso durante o feedback visual e so reseta depois do recolhimento.
      this.successTimerId = window.setTimeout(() => {
        if (this.pendingEvent) {
          this.pendingEvent.target.complete();
        }
        this.resetTimerId = window.setTimeout(() => {
          this.pendingEvent = undefined;
          this.isVisible = false;
          this.status = 'idle';
        }, this.closeAnimationBufferMs);
      }, this.successDisplayDurationMs);
    } else if (value === 'error') {
      // Escuta o restabelecimento da conexão para tentar novamente
      this.onlineHandler = () => {
        if (this.onlineHandler) {
          window.removeEventListener('online', this.onlineHandler);
          this.onlineHandler = undefined;
        }
        if (this.pendingEvent) {
          this.status = 'refreshing';
          // Re-executa o fluxo
          this.handleRefresh(this.pendingEvent);
        }
      };
      window.addEventListener('online', this.onlineHandler);
    }
  }

  ngOnDestroy(): void {
    this.clearPendingTimers();
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
    }
  }

  private clearPendingTimers(): void {
    if (this.successTimerId) {
      window.clearTimeout(this.successTimerId);
      this.successTimerId = undefined;
    }

    if (this.resetTimerId) {
      window.clearTimeout(this.resetTimerId);
      this.resetTimerId = undefined;
    }
  }
}
