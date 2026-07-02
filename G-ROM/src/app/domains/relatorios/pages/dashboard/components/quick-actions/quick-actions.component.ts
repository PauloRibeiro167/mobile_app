import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services';

import {
  PdvAccessOrigin,
  RegisterSessionService,
} from '@services/api';
import { PdvAccessService } from '@domains/pdv/services/pdv-access.service';
import { CloseRegisterModalComponent } from '@domains/gestao-caixa/components/close-register-modal/close-register-modal.component';
import { OpenRegisterModalComponent } from '@domains/gestao-caixa/components/open-register-modal/open-register-modal.component';

interface QuickAction {
  id: 'new-sale' | 'pricing' | 'close-register';
  label: string;
  description: string;
  icon: string;
  variant: 'success' | 'info' | 'danger';
  requiredPermissions: string[];
}

@Component({
  selector: 'app-dashboard-quick-actions',
  standalone: true,
  imports: [CommonModule, CloseRegisterModalComponent, OpenRegisterModalComponent],
  templateUrl: './quick-actions.component.html',
})
export class QuickActionsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly registerSessionService = inject(RegisterSessionService);
  private readonly pdvAccessService = inject(PdvAccessService);

  isCloseRegisterModalOpen = false;
  isOpenRegisterModalOpen = false;
  modalOrigin: PdvAccessOrigin = 'quick-actions';
  feedbackTone: 'info' | 'success' | 'warning' = 'info';

  async ngOnInit(): Promise<void> {
    await this.registerSessionService.initialize();
  }

  readonly actions: QuickAction[] = [
    {
      id: 'new-sale',
      label: 'Abrir caixa',
      description: 'Iniciar turno',
      icon: 'bi-upc-scan',
      variant: 'success',
      requiredPermissions: ['pdv.read', 'pdv.caixa'],
    },
    {
      id: 'pricing',
      label: 'Atualizar itens',
      description: 'Sincronizar catalogo',
      icon: 'bi bi-basket2-fill',
      variant: 'info',
      requiredPermissions: ['estoque.read', 'estoque.manage'],
    },
    {
      id: 'close-register',
      label: 'Fechar caixa',
      description: 'Encerrar turno',
      icon: 'bi-pc-display-horizontal',
      variant: 'danger',
      requiredPermissions: ['pdv.caixa'],
    },
  ];

  get visibleActions(): QuickAction[] {
    return this.actions.filter((action) =>
      action.requiredPermissions.some((permission) =>
        this.authService.hasPermission(permission)
      )
    );
  }

  trackByLabel(_: number, action: QuickAction): string {
    return action.id;
  }

  async handleAction(action: QuickAction): Promise<void> {
    if (this.isActionDisabled(action)) {
      this.publishFeedback(
        this.getActionDescription(action),
        'warning'
      );
      return;
    }

    if (action.id === 'new-sale') {
      const access = await this.pdvAccessService.requestPdvAccess(
        'quick-actions'
      );

      if (access.status === 'requires-opening') {
        this.modalOrigin = access.draft.origem;
        this.isOpenRegisterModalOpen = true;
        return;
      }

      await this.router.navigate(['/pdv']);
      return;
    }

    if (action.id === 'pricing') {
      await this.router.navigate(['/estoque']);
      return;
    }

    this.isCloseRegisterModalOpen = true;
  }

  handleCloseRegisterDismiss(): void {
    this.isCloseRegisterModalOpen = false;
  }

  handleOpenRegisterDismiss(): void {
    this.isOpenRegisterModalOpen = false;
  }

  async handleOpenRegisterSuccess(): Promise<void> {
    this.isOpenRegisterModalOpen = false;
    await this.router.navigate(['/pdv']);
  }

  getActionCardClass(action: QuickAction): string {
    if (action.id === 'new-sale') {
      return 'border-emerald-500/30 bg-gradient-to-b from-emerald-500/15 to-zinc-900 text-zinc-50';
    }

    if (action.id === 'pricing') {
      return 'border-amber-400/25 bg-gradient-to-b from-zinc-800 to-zinc-900 text-zinc-100';
    }

    return 'border-rose-400/25 bg-gradient-to-b from-zinc-800 to-zinc-900 text-zinc-100';
  }

  getActionIconClass(action: QuickAction): string {
    if (action.id === 'new-sale') {
      return 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300';
    }

    if (action.id === 'pricing') {
      return 'border-amber-400/30 bg-amber-400/15 text-amber-300';
    }

    return 'border-rose-400/30 bg-rose-400/15 text-rose-300';
  }

  getActionLabelClass(action: QuickAction): string {
    return action.id === 'new-sale'
      ? 'text-zinc-50'
      : 'text-zinc-100';
  }

  isActionDisabled(action: QuickAction): boolean {
    if (action.id === 'new-sale') {
      return this.registerSessionService.hasOpenSession();
    }

    if (action.id === 'close-register') {
      return !this.registerSessionService.canCloseRegister();
    }

    return false;
  }

  getActionDescription(action: QuickAction): string {
    if (action.id === 'close-register') {
      return this.registerSessionService.getClosingSummary();
    }

    if (action.id === 'new-sale') {
      if (this.registerSessionService.hasOpenSession()) {
        return 'Caixa já aberto. Feche o caixa atual antes de iniciar uma nova abertura.';
      }

      return this.registerSessionService.getSessionSummary();
    }

    return action.description;
  }

  getActionTitle(action: QuickAction): string {
    return this.getActionDescription(action);
  }


  get feedbackClass(): string {
    if (this.feedbackTone === 'success') {
      return 'mt-2 text-emerald-300';
    }

    if (this.feedbackTone === 'warning') {
      return 'mt-2 text-amber-300';
    }

    return 'mt-2 text-sky-300';
  }

  private publishFeedback(
    mensagem: string,
    tone: 'info' | 'success' | 'warning'
  ): void {
  }
}
