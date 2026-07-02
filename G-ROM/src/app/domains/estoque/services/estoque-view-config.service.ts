import { Injectable } from '@angular/core';

import { AppViewDefinition } from '@services';

@Injectable({ providedIn: 'root' })
export class EstoqueViewConfigService {
  getViews(): AppViewDefinition[] {
    return [
      {
        id: 'estoque.visao-geral',
        domain: 'estoque',
        title: 'Estoque',
        description: 'Controle de estoque, inventario, reposicao e movimentacoes.',
        route: '/estoque',
        icon: 'bi bi-box-seam',
        shell: 'app',
        placement: 'menu',
        section: 'Operação',
        access: {
          anyOf: ['estoque.read', 'estoque.manage'],
        },
      },
    ];
  }
}
