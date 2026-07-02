import { Injectable } from '@angular/core';

import { AppViewDefinition } from '@services';

@Injectable({ providedIn: 'root' })
export class RhViewConfigService {
  getViews(): AppViewDefinition[] {
    return [
      {
        id: 'rh.visao-geral',
        domain: 'rh',
        title: 'RH',
        description: 'Indicadores de equipe, escalas e visão resumida do time.',
        route: '/rh',
        icon: 'bi bi-people-fill',
        shell: 'app',
        placement: 'menu',
        section: 'Gestão',
        access: {
          anyOf: ['rh.read', 'rh.manage'],
        },
      },
    ];
  }
}
