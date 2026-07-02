import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { AuthService } from '@services';
import { OpenRegisterModalComponent } from '@domains/gestao-caixa/components/open-register-modal/open-register-modal.component';
import { CloseRegisterModalComponent } from '@domains/gestao-caixa/components/close-register-modal/close-register-modal.component';
import { GestaoCaixaViewConfigService } from '@domains/gestao-caixa/services/gestao-caixa-view-config.service';
import { RegisterOpeningService } from '@domains/gestao-caixa/services/register-opening.service';
import { RegisterSessionService } from '@domains/gestao-caixa/services/register-session.service';
import { PdvAccessOrigin, PdvAccessService } from '@domains/pdv/services/pdv-access.service';

interface GestaoCaixaResumoCard {
  label: string;
  value: string;
  tone: string;
}

interface GestaoCaixaDestaque {
  titulo: string;
  descricao: string;
}

@Component({
  selector: 'app-gestao-caixa-page',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    OpenRegisterModalComponent,
    CloseRegisterModalComponent,
  ],
  templateUrl: './gestao-caixa.page.html',
  styleUrls: ['./gestao-caixa.page.css'],
})
export class GestaoCaixaPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly pdvAccessService = inject(PdvAccessService);
  private readonly registerOpeningService = inject(RegisterOpeningService);
  private readonly registerSessionService = inject(RegisterSessionService);
  private readonly gestaoCaixaViewConfigService = inject(
    GestaoCaixaViewConfigService
  );

  readonly views = this.gestaoCaixaViewConfigService.getViews();
  readonly destaques: GestaoCaixaDestaque[] = [
    {
      titulo: 'Operação do turno',
      descricao:
        'Abertura e fechamento ficam centralizados no domínio, sem espalhar regra de caixa em outras views.',
    },
    {
      titulo: 'Leitura por permissão extra',
      descricao:
        'Gerente ou financeiro podem acompanhar o status do caixa sem precisar herdar o cargo de operador.',
    },
    {
      titulo: 'Escopo da sessão',
      descricao:
        'A apresentação do caixa respeita loja, setor e permissões efetivas da sessão autenticada.',
    },
  ];

  isCloseRegisterModalOpen = false;
  isOpenRegisterModalOpen = false;
  modalOrigin: PdvAccessOrigin = 'direct-route';

  async ngOnInit(): Promise<void> {
    await this.registerSessionService.initialize();
  }

  get session() {
    return this.authService.getSessaoAtual();
  }

  get aberturaAtual() {
    return this.registerSessionService.getCurrentSession();
  }

  get fechamentoStatus() {
    return this.registerOpeningService.getClosingAvailability();
  }

  get canOperateRegister(): boolean {
    return this.authService.hasPermission('pdv.caixa');
  }

  get canAccessPdv(): boolean {
    return this.authService.hasPermission('pdv.read');
  }

  get summaryCards(): GestaoCaixaResumoCard[] {
    const currentSession = this.session;
    const aberturaAtual = this.aberturaAtual;

    return [
      {
        label: 'Status do caixa',
        value: aberturaAtual?.statusCaixa ?? 'FECHADO',
        tone: aberturaAtual
          ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
          : 'border-rose-400/20 bg-rose-400/10 text-rose-100',
      },
      {
        label: 'Fundo de troco',
        value: aberturaAtual
          ? aberturaAtual.fundoTroco.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })
          : 'R$ 0,00',
        tone: 'border-sky-400/20 bg-sky-400/10 text-sky-100',
      },
      {
        label: 'Permissões da sessão',
        value: String(currentSession?.permissions.length ?? 0),
        tone: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-100',
      },
      {
        label: 'Views do domínio',
        value: String(this.views.length),
        tone: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
      },
    ];
  }

  async openPdv(): Promise<void> {
    if (!this.canAccessPdv) {
      return;
    }

    const access = await this.pdvAccessService.requestPdvAccess('direct-route');

    if (access.status === 'requires-opening') {
      this.modalOrigin = access.draft.origem;
      this.isOpenRegisterModalOpen = true;
      return;
    }

    await this.router.navigate(['/pdv']);
  }

  openRegister(): void {
    if (!this.canOperateRegister) {
      return;
    }

    this.modalOrigin = 'direct-route';
    this.isOpenRegisterModalOpen = true;
  }

  closeRegister(): void {
    if (!this.canOperateRegister) {
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
  }
}
