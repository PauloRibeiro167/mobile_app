import { Injectable } from '@angular/core';

import mockProfiles from './mocks/mock-profiles.json';
import mockUsers from './mocks/mock-users.json';
import {
  MockProfileDefinition,
  MockUserDefinition,
} from '../../models/access-control.models';

@Injectable({ providedIn: 'root' })
export class ProfileManagementService {
  private readonly profiles = mockProfiles as MockProfileDefinition[];
  private readonly users = mockUsers as MockUserDefinition[];

  getProfiles(): MockProfileDefinition[] {
    return this.profiles.map((profile) => ({
      ...profile,
      permissions: [...profile.permissions],
    }));
  }

  getUsers(): MockUserDefinition[] {
    return this.users.map((user) => ({
      ...user,
      profiles: [...user.profiles],
      additionalPermissions: [...user.additionalPermissions],
      scopes: {
        ...user.scopes,
        lojas: [...user.scopes.lojas],
        setores: [...user.scopes.setores],
      },
    }));
  }

  getProfileByName(profileName: string): MockProfileDefinition | undefined {
    return this.getProfiles().find((profile) => profile.nome === profileName);
  }

  getUserById(userId: string): MockUserDefinition | undefined {
    return this.getUsers().find((user) => user.id === userId);
  }

  getUserByEmail(email: string): MockUserDefinition | undefined {
    return this.getUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  authenticate(email: string, password: string): MockUserDefinition | null {
    const user = this.getUserByEmail(email);
    if (!user) {
      return null;
    }

    return user.password === password ? user : null;
  }
}
