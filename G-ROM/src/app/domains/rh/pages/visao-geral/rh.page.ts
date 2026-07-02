import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { AuthService } from '@services';
import { RhViewConfigService } from '@domains/rh/services/rh-view-config.service';

interface RhResumoCard {
  label: string;
  value: string;
  tone: string;
}

@Component({
  selector: 'app-rh-page',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './rh.page.html',
  styleUrls: ['./rh.page.css'],
})
export class RhPage {
  private readonly authService = inject(AuthService);
  private readonly rhViewConfigService = inject(RhViewConfigService);

  readonly views = this.rhViewConfigService.getViews();
  readonly destaques = [
    {
      titulo: 'Escalas e turnos',
      descricao: 'Exibir jornada, plantões e pendências sempre filtrando loja, setor e supervisor responsável.',
    },
    {
      titulo: 'Leitura de equipe',
      descricao: 'Separar quem só acompanha o time de quem pode alterar dados de RH.',
    },
    {
      titulo: 'Permissão fora do cargo',
      descricao: 'Aceitar leitura de RH para gerente ou TI sem colar essa regra no nome do perfil.',
    },
  ];

  get session() {
    return this.authService.getSessaoAtual();
  }

  get summaryCards(): RhResumoCard[] {
    const currentSession = this.session;

    return [
      {
        label: 'Views do domínio',
        value: String(this.views.length),
        tone: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100',
      },
      {
        label: 'Setores visíveis',
        value: String(currentSession?.scopes.setores.length ?? 0),
        tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
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
