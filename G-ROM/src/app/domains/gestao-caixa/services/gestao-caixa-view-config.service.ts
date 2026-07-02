import { Injectable } from '@angular/core';

import { AppViewDefinition } from '@services';

@Injectable({ providedIn: 'root' })
export class GestaoCaixaViewConfigService {
  getViews(): AppViewDefinition[] {
    return [
      {
        id: 'gestao-caixa.visao-geral',
        domain: 'gestao-caixa',
        title: 'Gestão de caixa',
        description: 'Abertura, acompanhamento do turno e fechamento operacional do caixa.',
        route: '/gestao-caixa',
        icon: 'bi bi-safe2',
        shell: 'operational',
        placement: 'menu',
        section: 'Operação',
        access: {
          anyOf: ['pdv.caixa', 'financeiro.read'],
        },
      },
    ];
  }
}
