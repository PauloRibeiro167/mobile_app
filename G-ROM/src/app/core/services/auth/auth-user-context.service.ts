import { Injectable } from '@angular/core';

import { AuthSession, AuthSessionUser } from '../../models/access-control.models';
import type { UserProfile } from '../api/user/user.service';

@Injectable({ providedIn: 'root' })
export class AuthUserContextService {
  buildSessionUser(session: AuthSession): AuthSessionUser {
    return {
      ...session.user,
    };
  }

  toUserProfile(session: AuthSession | null): UserProfile {
    if (!session) {
      return {
        nome: 'Sessão não iniciada',
        cargo: 'SEM ACESSO',
        turno: 'Indefinido',
        status: 'offline',
        isVerificado: false,
      };
    }

    return {
      id: session.user.id,
      nome: session.user.nome,
      cargo: session.user.cargo,
      turno: session.user.turno,
      status: session.user.status,
      isVerificado: session.profileNames.length > 0,
      telefone: '(85) 99999-0000',
      departamento: session.user.departamento,
      avatarUrl: session.user.avatarUrl,
      perfis: session.profileNames,
      permissions: session.permissions,
      scopes: session.scopes,
      situacao: session.user.situacao,
    };
  }
}
