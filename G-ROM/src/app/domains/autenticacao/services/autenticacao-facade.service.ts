import { Injectable, inject } from '@angular/core';

import { AuthMockService, AuthService, MockUserDefinition, PreferencesService } from '@services';
import { LoginFormService, LoginFormState } from './login-form.service';

@Injectable({ providedIn: 'root' })
export class AutenticacaoFacadeService {
  private readonly rememberedUserKey = 'rememberedUser';
  private readonly authService = inject(AuthService);
  private readonly authMockService = inject(AuthMockService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly loginFormService = inject(LoginFormService);

  getMockUsers(): MockUserDefinition[] {
    return this.authMockService.getMockUsers();
  }

  buildInitialFormState(): LoginFormState {
    return this.loginFormService.buildInitialState(this.getMockUsers()[0]);
  }

  async initializeAuth(): Promise<void> {
    await this.authService.initialize();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getFallbackRoute(): string {
    return this.authService.getFallbackRoute();
  }

  togglePassword(state: LoginFormState): LoginFormState {
    return this.loginFormService.togglePassword(state);
  }

  fillWithMockUser(state: LoginFormState, user: MockUserDefinition): LoginFormState {
    return this.loginFormService.fillWithMockUser(state, user);
  }

  async loadRememberedUser(state: LoginFormState): Promise<LoginFormState> {
    const rememberedUser = await this.preferencesService.getJson<{
      email: string;
      rememberMe: boolean;
    } | null>(this.rememberedUserKey, null);

    return this.loginFormService.applyRememberedUser(state, rememberedUser);
  }

  async login(state: LoginFormState): Promise<boolean> {
    return this.authService.login(state.email, state.password);
  }

  async persistRememberedUser(state: LoginFormState): Promise<void> {
    if (state.rememberMe) {
      await this.preferencesService.setJson(this.rememberedUserKey, {
        email: state.email,
        rememberMe: true,
      });
      return;
    }

    await this.preferencesService.remove(this.rememberedUserKey);
  }

  setLoading(state: LoginFormState, isLoading: boolean): LoginFormState {
    return this.loginFormService.setLoading(state, isLoading);
  }
}
