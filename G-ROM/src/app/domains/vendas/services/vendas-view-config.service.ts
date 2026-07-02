import { Injectable } from '@angular/core';

import { AppViewDefinition } from '@services';

@Injectable({ providedIn: 'root' })
export class VendasViewConfigService {
  getViews(): AppViewDefinition[] {
    return [
      {
        id: 'vendas.historico',
        domain: 'vendas',
        title: 'Historico',
        description: 'Consulta de vendas finalizadas, cancelamentos e resumo do dia.',
        route: '/historico',
        icon: 'bi bi-clock-history',
        shell: 'app',
        placement: 'menu',
        section: 'Operação',
        access: {
          anyOf: ['vendas.historico.read', 'pdv.read'],
        },
      },
    ];
  }
}
