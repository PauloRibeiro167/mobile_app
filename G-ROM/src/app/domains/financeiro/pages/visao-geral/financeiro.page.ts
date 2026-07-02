import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { AuthService } from '@services';
import { FinanceiroViewConfigService } from '@domains/financeiro/services/financeiro-view-config.service';

interface FinanceiroResumoCard {
  label: string;
  value: string;
  tone: string;
}

@Component({
  selector: 'app-financeiro-page',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './financeiro.page.html',
  styleUrls: ['./financeiro.page.css'],
})
export class FinanceiroPage {
  private readonly authService = inject(AuthService);
  private readonly financeiroViewConfigService = inject(FinanceiroViewConfigService);

  readonly views = this.financeiroViewConfigService.getViews();

  readonly destaques = [
    {
      titulo: 'Conciliação de caixa',
      descricao: 'Separar leitura de fechamento e poder de ajuste sem misturar com o perfil-base do usuário.',
    },
    {
      titulo: 'Contas do dia',
      descricao: 'Agrupar contas a pagar e receber por escopo de loja e por rotina de conferência.',
    },
    {
      titulo: 'Permissões extras',
      descricao: 'Permitir que um gerente ou TI ganhe leitura financeira sem virar dono do domínio.',
    },
  ];

  get session() {
    return this.authService.getSessaoAtual();
  }

  get summaryCards(): FinanceiroResumoCard[] {
    const currentSession = this.session;

    return [
      {
        label: 'Views do domínio',
        value: String(this.views.length),
        tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
      },
      {
        label: 'Lojas no escopo',
        value: String(currentSession?.scopes.lojas.length ?? 0),
        tone: 'border-sky-400/20 bg-sky-400/10 text-sky-100',
      },
      {
        label: 'Permissões da sessão',
        value: String(currentSession?.permissions.length ?? 0),
        tone: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-100',
      },
      {
        label: 'Perfis combinados',
        value: String(currentSession?.profileNames.length ?? 0),
        tone: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
      },
    ];
  }
}
