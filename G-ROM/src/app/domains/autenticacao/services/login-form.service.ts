import { Injectable } from '@angular/core';

import { MockUserDefinition } from '@services';

export interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
  showPassword: boolean;
  isLoading: boolean;
}

@Injectable({ providedIn: 'root' })
export class LoginFormService {
  buildInitialState(defaultUser?: MockUserDefinition): LoginFormState {
    return {
      email: defaultUser?.email ?? '',
      password: defaultUser?.password ?? '',
      rememberMe: false,
      showPassword: false,
      isLoading: false,
    };
  }

  fillWithMockUser(state: LoginFormState, user: MockUserDefinition): LoginFormState {
    return {
      ...state,
      email: user.email,
      password: user.password,
    };
  }

  togglePassword(state: LoginFormState): LoginFormState {
    return {
      ...state,
      showPassword: !state.showPassword,
    };
  }

  setLoading(state: LoginFormState, isLoading: boolean): LoginFormState {
    return {
      ...state,
      isLoading,
    };
  }

  applyRememberedUser(
    state: LoginFormState,
    rememberedUser: { email: string; rememberMe: boolean } | null
  ): LoginFormState {
    if (!rememberedUser) {
      return state;
    }

    return {
      ...state,
      email: rememberedUser.email,
      rememberMe: rememberedUser.rememberMe,
    };
  }
}
