import { Injectable } from '@angular/core';

import { AppViewDefinition } from '@services';

@Injectable({ providedIn: 'root' })
export class FinanceiroViewConfigService {
  getViews(): AppViewDefinition[] {
    return [
      {
        id: 'financeiro.visao-geral',
        domain: 'financeiro',
        title: 'Financeiro',
        description: 'Resumo de caixa, conciliacoes e contas do dia.',
        route: '/financeiro',
        icon: 'bi bi-cash-coin',
        shell: 'app',
        placement: 'menu',
        section: 'Gestão',
        access: {
          anyOf: ['financeiro.read'],
        },
      },
    ];
  }
}
