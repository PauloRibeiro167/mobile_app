import { Injectable, inject } from '@angular/core';

import { MockProfileDefinition, MockUserDefinition } from '../../models/access-control.models';
import { ProfileManagementService } from './profile-management.service';

@Injectable({ providedIn: 'root' })
export class AuthMockService {
  private readonly profileManagementService = inject(ProfileManagementService);

  getMockUsers(): MockUserDefinition[] {
    return this.profileManagementService.getUsers();
  }

  getMockProfiles(): MockProfileDefinition[] {
    return this.profileManagementService.getProfiles();
  }

  getMockUserById(userId: string): MockUserDefinition | undefined {
    return this.profileManagementService.getUserById(userId);
  }

  authenticate(email: string, password: string): MockUserDefinition | null {
    return this.profileManagementService.authenticate(email, password);
  }
}
