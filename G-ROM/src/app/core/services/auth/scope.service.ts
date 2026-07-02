import { Injectable } from '@angular/core';

import { PermissionScope } from '../../models/access-control.models';

@Injectable({ providedIn: 'root' })
export class ScopeService {
  clone(scope: PermissionScope): PermissionScope {
    return {
      ...scope,
      lojas: [...scope.lojas],
      setores: [...scope.setores],
    };
  }

  summarize(scope: PermissionScope): string {
    const ownOnly = scope.ownOnly ? 'somente contexto proprio' : 'contexto ampliado';
    return `${scope.lojas.length} loja(s), ${scope.setores.length} setor(es), ${ownOnly}`;
  }
}
