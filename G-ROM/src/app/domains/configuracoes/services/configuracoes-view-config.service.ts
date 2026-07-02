import { Injectable } from '@angular/core';

import { AppViewDefinition } from '@services';

@Injectable({ providedIn: 'root' })
export class ConfiguracoesViewConfigService {
  getViews(): AppViewDefinition[] {
    return [
      {
        id: 'configuracoes.meu-perfil',
        domain: 'configuracoes',
        title: 'Meu Perfil',
        description: 'Resumo do perfil atual, perfis atribuídos e permissões efetivas.',
        route: '/meu-perfil',
        icon: 'bi bi-person-circle',
        shell: 'app',
        placement: 'menu',
        section: 'Conta',
        access: {
          anyOf: ['settings.self', 'configuracoes.perfil.read'],
        },
      },
      {
        id: 'configuracoes.aparencia',
        domain: 'configuracoes',
        title: 'Configuracoes',
        description: 'Preferencias de aparência, suporte e ajustes do aplicativo.',
        route: '/config',
        icon: 'bi bi-gear-fill',
        shell: 'app',
        placement: 'menu',
        section: 'Conta',
        access: {
          anyOf: ['settings.appearance', 'admin.configuracoes.read'],
        },
      },
    ];
  }
}
