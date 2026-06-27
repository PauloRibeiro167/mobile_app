import { Injectable, computed, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ModalConfig {
  id: string;
  title: string;
  message: string;
  icon: string;
  confirmText: string | null;
  cancelText: string | null;
  isAlert: boolean;
}

export type ModalFocusField = 'cpf' | 'inscricao';

export type ModalEvent =
  | { kind: 'clearForm' }
  | { kind: 'focus'; field: ModalFocusField }
  | { kind: 'retrySearch' };

interface ModalActionHandlers {
  onConfirm?: () => void;
  onCancel?: () => void;
}

export enum ModalType {
  RESULT = 'result',
  DICA = 'dica',
  CPF = 'cpf',
  AJUDA_INSCRICAO = 'ajudaInscricao',
  INFO_INSCRICAO = 'infoInscricao',
  ERRO_API = 'erroApi'
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: Map<ModalType, ModalConfig> = new Map();
  private modalActions: Map<ModalType, ModalActionHandlers> = new Map();
  private readonly visibleModalIds = signal<Set<ModalType>>(new Set());
  private readonly modalEventsSubject = new Subject<ModalEvent>();

  readonly visibleModals = computed(() => {
    const ids = Array.from(this.visibleModalIds());
    return ids
      .map(id => this.modals.get(id))
      .filter((modal): modal is ModalConfig => !!modal);
  });

  constructor() {
    this.initializeModals();
    this.initializeModalActions();
  }

  private initializeModals(): void {
    this.modals.set(ModalType.RESULT, {
      id: ModalType.RESULT,
      title: 'Resultado da Busca',
      message: '',
      icon: 'bi-search',
      confirmText: null,
      cancelText: 'Fechar',
      isAlert: true
    });

    this.modals.set(ModalType.DICA, {
      id: ModalType.DICA,
      title: 'Dica de Busca',
      message: 'Você pode pesquisar usando apenas um dos campos. Para resultados mais precisos, preencha o número de inscrição do imóvel.',
      icon: 'bi-lightbulb',
      confirmText: null,
      cancelText: 'Fechar',
      isAlert: true
    });

    this.modals.set(ModalType.CPF, {
      id: ModalType.CPF,
      title: 'Informação CPF/CNPJ',
      message: 'Digite o CPF ou CNPJ do proprietário do imóvel para realizar a busca.',
      icon: 'bi-person',
      confirmText: null,
      cancelText: 'Fechar',
      isAlert: true
    });

    this.modals.set(ModalType.AJUDA_INSCRICAO, {
      id: ModalType.AJUDA_INSCRICAO,
      title: 'Ajuda com Inscrição',
      message: 'A inscrição imobiliária é um número único que identifica o imóvel no cadastro municipal.',
      icon: 'bi-question-circle',
      confirmText: null,
      cancelText: 'Fechar',
      isAlert: true
    });

    this.modals.set(ModalType.INFO_INSCRICAO, {
      id: ModalType.INFO_INSCRICAO,
      title: 'Informação sobre Inscrição',
      message: 'Para obter informações detalhadas sobre o imóvel, utilize a inscrição imobiliária.',
      icon: 'bi-building',
      confirmText: null,
      cancelText: 'Fechar',
      isAlert: true
    });

    this.modals.set(ModalType.ERRO_API, {
      id: ModalType.ERRO_API,
      title: 'Erro',
      message: 'Não foi possível realizar a operação. Tente novamente mais tarde.',
      icon: 'bi-wifi-off',
      confirmText: 'Tentar Novamente',
      cancelText: 'Fechar',
      isAlert: false
    });
  }

  private initializeModalActions(): void {
    this.modalActions.set(ModalType.RESULT, {
      onCancel: () => {
        this.emitEvent({ kind: 'clearForm' });
        this.hideModal(ModalType.RESULT);
      }
    });

    this.modalActions.set(ModalType.CPF, {
      onCancel: () => {
        this.emitEvent({ kind: 'focus', field: 'cpf' });
        this.hideModal(ModalType.CPF);
      }
    });

    this.modalActions.set(ModalType.INFO_INSCRICAO, {
      onCancel: () => {
        this.emitEvent({ kind: 'focus', field: 'inscricao' });
        this.hideModal(ModalType.INFO_INSCRICAO);
      }
    });

    this.modalActions.set(ModalType.ERRO_API, {
      onConfirm: () => {
        this.hideModal(ModalType.ERRO_API);
        this.emitEvent({ kind: 'retrySearch' });
      },
      onCancel: () => {
        this.hideModal(ModalType.ERRO_API);
      }
    });
  }

  private emitEvent(event: ModalEvent): void {
    this.modalEventsSubject.next(event);
  }

  get modalEvents$(): Observable<ModalEvent> {
    return this.modalEventsSubject.asObservable();
  }

  getModal(type: ModalType): ModalConfig | undefined {
    return this.modals.get(type);
  }

  getAllModals(): ModalConfig[] {
    return Array.from(this.modals.values());
  }

  updateModalMessage(type: ModalType, message: string): void {
    const modal = this.modals.get(type);
    if (modal) {
      modal.message = message;
      // Força atualização das views que dependem da lista de modais visíveis
      this.visibleModalIds.update(ids => new Set(ids));
    }
  }

  showModal(type: ModalType, options?: { message?: string }): void {
    if (options?.message) {
      this.updateModalMessage(type, options.message);
    }

    this.visibleModalIds.update(ids => {
      const newIds = new Set(ids);
      newIds.add(type);
      return newIds;
    });
  }

  hideModal(type: ModalType): void {
    this.visibleModalIds.update(ids => {
      if (!ids.has(type)) return ids;
      const newIds = new Set(ids);
      newIds.delete(type);
      return newIds;
    });
  }

  handleConfirm(type: ModalType): void {
    const handlers = this.modalActions.get(type);
    handlers?.onConfirm?.();
    if (!handlers?.onConfirm) {
      this.hideModal(type);
    }
  }

  handleCancel(type: ModalType): void {
    const handlers = this.modalActions.get(type);
    handlers?.onCancel?.();
    if (!handlers?.onCancel) {
      this.hideModal(type);
    }
  }

  isModalVisible(type: ModalType): boolean {
    return this.visibleModalIds().has(type);
  }
}