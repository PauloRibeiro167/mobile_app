import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import {
  AuthSession,
  AuthSessionUser,
} from '../../models/access-control.models';
import { AccessControlService } from './access-control.service';
import { AuthSessionService } from './auth-session.service';
import { AuthApiService } from './auth-api.service';
import { PermissionService } from './permission.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accessControlService = inject(AccessControlService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly authApiService = inject(AuthApiService);
  private readonly permissionService = inject(PermissionService);
  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(null);
  readonly sessao$ = this.sessionSubject.asObservable();
  readonly usuarioLogado$ = this.sessao$.pipe(map((session) => session?.user ?? null));
  private initializationPromise: Promise<void>;

  constructor() {
    this.initializationPromise = this.loadSessionPersistida();
  }

  async initialize(): Promise<void> {
    await this.initializationPromise;
  }

  isAuthenticated(): boolean {
    return !!this.sessionSubject.getValue();
  }

  getUsuarioLogado(): AuthSessionUser | null {
    return this.sessionSubject.getValue()?.user ?? null;
  }

  getSessaoAtual(): AuthSession | null {
    return this.sessionSubject.getValue();
  }

  getFallbackRoute(): string {
    const session = this.getSessaoAtual();
    return session
      ? this.accessControlService.getSuggestedLandingRoute(session)
      : '/login';
  }

  hasPermission(permissionKey: string): boolean {
    return this.permissionService.hasPermission(this.getSessaoAtual(), permissionKey);
  }

  canAccessView(viewId: string): boolean {
    const session = this.getSessaoAtual();
    return !!session && this.accessControlService.canAccessView(session, viewId);
  }

  async login(email: string, senha: string): Promise<boolean> {
    if (!email || !senha) {
      return false;
    }

    const user = await this.authApiService.login(email, senha);
    if (!user) {
      return false;
    }

    const session = this.accessControlService.buildSession(user);
    this.sessionSubject.next(session);
    await this.authSessionService.save({ userId: user.id });
    return true;
  }

  logout(): void {
    this.sessionSubject.next(null);
    void this.authSessionService.clear();
    sessionStorage.removeItem('dashboard:intro-cards-visible');
  }

  async switchUser(userId: string): Promise<boolean> {
    const user = await this.authApiService.restoreUser(userId);
    if (!user) {
      return false;
    }

    const session = this.accessControlService.buildSession(user);
    this.sessionSubject.next(session);
    await this.authSessionService.save({ userId: user.id });
    return true;
  }

  private async loadSessionPersistida(): Promise<void> {
    const persisted = await this.authSessionService.load();
    if (!persisted?.userId) {
      this.sessionSubject.next(null);
      return;
    }

    const user = await this.authApiService.restoreUser(persisted.userId);
    if (!user) {
      await this.authSessionService.clear();
      this.sessionSubject.next(null);
      return;
    }

    this.sessionSubject.next(this.accessControlService.buildSession(user));
  }
}
