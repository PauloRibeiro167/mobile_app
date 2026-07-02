import { Injectable, inject } from '@angular/core';

import { MockUserDefinition } from '../../models/access-control.models';
import { AuthMockService } from './auth-mock.service';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly authMockService = inject(AuthMockService);

  async login(email: string, password: string): Promise<MockUserDefinition | null> {
    return this.authMockService.authenticate(email, password);
  }

  async restoreUser(userId: string): Promise<MockUserDefinition | null> {
    return this.authMockService.getMockUserById(userId) ?? null;
  }
}
