import { Injectable, inject } from '@angular/core';

import { AdminViewConfigService } from '@domains/admin/services/admin-view-config.service';
import { ConfiguracoesViewConfigService } from '@domains/configuracoes/services/configuracoes-view-config.service';
import { EstoqueViewConfigService } from '@domains/estoque/services/estoque-view-config.service';
import { FinanceiroViewConfigService } from '@domains/financeiro/services/financeiro-view-config.service';
import { GestaoCaixaViewConfigService } from '@domains/gestao-caixa/services/gestao-caixa-view-config.service';
import { PdvViewConfigService } from '@domains/pdv/services/pdv-view-config.service';
import { RelatoriosViewConfigService } from '@domains/relatorios/services/relatorios-view-config.service';
import { RhViewConfigService } from '@domains/rh/services/rh-view-config.service';
import { VendasViewConfigService } from '@domains/vendas/services/vendas-view-config.service';
import {
  AppViewDefinition,
  AuthSession,
  MockProfileDefinition,
  MockUserDefinition,
} from '../../models/access-control.models';
import { ProfileManagementService } from './profile-management.service';
import { PermissionService } from './permission.service';
import { ScopeService } from './scope.service';
import { AuthUserContextService } from './auth-user-context.service';

@Injectable({ providedIn: 'root' })
export class AccessControlService {
  private readonly profileManagementService = inject(ProfileManagementService);
  private readonly permissionService = inject(PermissionService);
  private readonly scopeService = inject(ScopeService);
  private readonly authUserContextService = inject(AuthUserContextService);
  private readonly adminViewConfigService = inject(AdminViewConfigService);
  private readonly configuracoesViewConfigService = inject(ConfiguracoesViewConfigService);
  private readonly estoqueViewConfigService = inject(EstoqueViewConfigService);
  private readonly financeiroViewConfigService = inject(FinanceiroViewConfigService);
  private readonly gestaoCaixaViewConfigService = inject(GestaoCaixaViewConfigService);
  private readonly pdvViewConfigService = inject(PdvViewConfigService);
  private readonly relatoriosViewConfigService = inject(RelatoriosViewConfigService);
  private readonly rhViewConfigService = inject(RhViewConfigService);
  private readonly vendasViewConfigService = inject(VendasViewConfigService);

  buildSession(user: MockUserDefinition): AuthSession {
    const profiles = user.profiles
      .map((profileName) => this.profileManagementService.getProfileByName(profileName))
      .filter((profile): profile is MockProfileDefinition => !!profile);
    const profilePermissions = profiles.flatMap((profile) => profile.permissions);
    const { aliases, permissions } = this.permissionService.buildEffectivePermissions(
      profilePermissions,
      user.additionalPermissions
    );
    const baseSession = {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        departamento: user.departamento,
        turno: user.turno,
        status: user.status,
        situacao: user.situacao,
        avatarUrl: user.avatarUrl,
      },
      profileNames: [...user.profiles],
      profiles,
      permissions,
      scopes: this.scopeService.clone(user.scopes),
      availableViews: [] as AppViewDefinition[],
      permissionSources: {
        global: this.permissionService.getGlobalAuthenticatedPermissions(),
        profile: this.permissionService.unique(profilePermissions),
        additional: this.permissionService.unique(user.additionalPermissions),
        aliases,
      },
    } satisfies Omit<AuthSession, 'availableViews'> & { availableViews: AppViewDefinition[] };

    baseSession.user = this.authUserContextService.buildSessionUser(baseSession as AuthSession);

    return {
      ...baseSession,
      availableViews: this.getAccessibleViews(baseSession),
    };
  }

  getAllViews(): AppViewDefinition[] {
    return [
      ...this.relatoriosViewConfigService.getViews(),
      ...this.pdvViewConfigService.getViews(),
      ...this.vendasViewConfigService.getViews(),
      ...this.estoqueViewConfigService.getViews(),
      ...this.rhViewConfigService.getViews(),
      ...this.financeiroViewConfigService.getViews(),
      ...this.gestaoCaixaViewConfigService.getViews(),
      ...this.adminViewConfigService.getViews(),
      ...this.configuracoesViewConfigService.getViews(),
    ];
  }

  getAccessibleViews(session: Pick<AuthSession, 'permissions' | 'profileNames'>): AppViewDefinition[] {
    return this.getAllViews().filter((view) => this.canAccessViewDefinition(session, view));
  }

  canAccessView(session: Pick<AuthSession, 'permissions' | 'profileNames'>, viewId: string): boolean {
    const view = this.getAllViews().find((entry) => entry.id === viewId);
    return !!view && this.canAccessViewDefinition(session, view);
  }

  getAccessibleMenuViews(session: Pick<AuthSession, 'permissions' | 'profileNames'>): AppViewDefinition[] {
    return this.getAccessibleViews(session).filter((view) => view.placement === 'menu');
  }

  getAccessibleTabViews(session: Pick<AuthSession, 'permissions' | 'profileNames'>): AppViewDefinition[] {
    return this.getAccessibleViews(session).filter((view) => view.placement === 'tab');
  }

  getSuggestedLandingRoute(session: AuthSession): string {
    const explicitLanding = session.profiles
      .map((profile) => profile.landingRoute)
      .find((route): route is string => !!route && this.getAccessibleViews(session).some((view) => view.route === route));

    if (explicitLanding) {
      return explicitLanding;
    }

    return session.availableViews[0]?.route ?? '/meu-perfil';
  }

  private canAccessViewDefinition(
    session: Pick<AuthSession, 'permissions' | 'profileNames'>,
    view: AppViewDefinition
  ): boolean {
    return this.permissionService.matchesRule(session, view.access);
  }
}
