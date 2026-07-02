import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { AuthService, AuthUserContextService, PermissionScope } from '@services';

export interface UserProfile {
  nome: string;
  cargo: string;
  turno: string;
  status: 'online' | 'offline' | 'ausente';
  id?: string;
  isVerificado?: boolean;
  avatarUrl?: string;
  telefone?: string;
  departamento?: string;
  perfis?: string[];
  permissions?: string[];
  scopes?: PermissionScope;
  situacao?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly authService = inject(AuthService);
  private readonly authUserContextService = inject(AuthUserContextService);

  getUserProfile(): Observable<UserProfile> {
    return this.authService.sessao$.pipe(
      map((session) => this.authUserContextService.toUserProfile(session))
    );
  }
}
