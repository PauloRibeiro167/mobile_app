import { Injectable } from '@angular/core';

import { AppViewDefinition } from '@services';

@Injectable({ providedIn: 'root' })
export class RelatoriosViewConfigService {
  getViews(): AppViewDefinition[] {
    return [
      {
        id: 'relatorios.dashboard',
        domain: 'relatorios',
        title: 'Dashboard',
        description: 'Painel principal com visão executiva e operacional conforme o acesso do usuário.',
        route: '/home',
        icon: 'bi bi-grid-fill',
        shell: 'app',
        placement: 'menu',
        section: 'Operação',
        access: {
          anyOf: [
            'dashboard.admin',
            'dashboard.crm',
            'dashboard.estoque',
            'dashboard.financeiro',
            'dashboard.pdv',
            'dashboard.rh',
          ],
        },
      },
    ];
  }
}
