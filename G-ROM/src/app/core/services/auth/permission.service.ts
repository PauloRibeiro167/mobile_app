import { Injectable } from '@angular/core';

import { AuthSession, PermissionRule } from '../../models/access-control.models';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly globalAuthenticatedPermissions = [
    'app.authenticated',
    'settings.self',
    'configuracoes.perfil.read',
  ];

  getGlobalAuthenticatedPermissions(): string[] {
    return [...this.globalAuthenticatedPermissions];
  }

  buildAliases(permissions: string[]): string[] {
    const aliases: string[] = [];

    if (permissions.some((permission) => permission.startsWith('admin.'))) {
      aliases.push('admin.read');
    }
    if (permissions.some((permission) => permission.startsWith('rh.'))) {
      aliases.push('rh.read');
    }
    if (permissions.some((permission) => permission.startsWith('pdv.'))) {
      aliases.push('pdv.read');
    }
    if (permissions.some((permission) => permission.startsWith('estoque.'))) {
      aliases.push('estoque.read');
    }
    if (permissions.some((permission) => permission.startsWith('financeiro.'))) {
      aliases.push('financeiro.read');
    }
    if (permissions.some((permission) => permission.startsWith('crm.'))) {
      aliases.push('crm.read');
    }
    if (permissions.some((permission) => permission.startsWith('admin.configuracoes.'))) {
      aliases.push('settings.appearance');
    }

    return this.unique(aliases);
  }

  buildEffectivePermissions(profilePermissions: string[], additionalPermissions: string[]): {
    permissions: string[];
    aliases: string[];
  } {
    const aliases = this.buildAliases([...profilePermissions, ...additionalPermissions]);
    return {
      aliases,
      permissions: this.unique([
        ...this.getGlobalAuthenticatedPermissions(),
        ...profilePermissions,
        ...additionalPermissions,
        ...aliases,
      ]),
    };
  }

  hasPermission(session: Pick<AuthSession, 'permissions'> | null, permissionKey: string): boolean {
    return session?.permissions.includes(permissionKey) ?? false;
  }

  matchesRule(
    session: Pick<AuthSession, 'permissions' | 'profileNames'>,
    rule?: PermissionRule
  ): boolean {
    if (!rule) {
      return true;
    }

    const hasAny = !rule.anyOf?.length || rule.anyOf.some((permission) => session.permissions.includes(permission));
    const hasAll = !rule.allOf?.length || rule.allOf.every((permission) => session.permissions.includes(permission));
    const hasProfile = !rule.profilesAnyOf?.length || rule.profilesAnyOf.some((profile) => session.profileNames.includes(profile));

    return hasAny && hasAll && hasProfile;
  }

  unique(permissions: string[]): string[] {
    return Array.from(new Set(permissions));
  }
}
