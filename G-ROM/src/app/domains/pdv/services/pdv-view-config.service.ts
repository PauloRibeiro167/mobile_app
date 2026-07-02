import { Injectable } from '@angular/core';

import { AppViewDefinition } from '@services';

@Injectable({ providedIn: 'root' })
export class PdvViewConfigService {
  getViews(): AppViewDefinition[] {
    return [
      {
        id: 'pdv.operacao',
        domain: 'pdv',
        title: 'PDV',
        description: 'Operação de caixa, leitura de itens e fechamento da venda.',
        route: '/pdv',
        icon: 'bi bi-calculator',
        shell: 'operational',
        placement: 'tab',
        section: 'Operação',
        access: {
          anyOf: ['pdv.read', 'pdv.caixa'],
        },
      },
    ];
  }
}
