import { Injectable } from '@angular/core';

import { AppViewDefinition } from '@services';

@Injectable({ providedIn: 'root' })
export class AdminViewConfigService {
  getViews(): AppViewDefinition[] {
    return [
      {
        id: 'admin.acessos',
        domain: 'admin',
        title: 'Acessos',
        description: 'Simulação de perfis, permissões e troca de usuário para validar as views.',
        route: '/admin/acessos',
        icon: 'bi bi-shield-lock-fill',
        shell: 'admin',
        placement: 'menu',
        section: 'Administração',
        access: {
          anyOf: ['admin.perfis.read', 'core.authentication.manage', 'admin.read'],
        },
      },
    ];
  }
}
