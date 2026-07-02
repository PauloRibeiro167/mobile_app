import { Injectable, inject } from '@angular/core';

import { PreferencesService } from '../infraestrutura/preferences.service';
import { PersistedAuthSession } from '../../models/access-control.models';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly storageKey = 'authSession';
  private readonly preferencesService = inject(PreferencesService);

  async save(session: PersistedAuthSession): Promise<void> {
    await this.preferencesService.setJson(this.storageKey, session);
  }

  async load(): Promise<PersistedAuthSession | null> {
    const rawSession = await this.preferencesService.getString(this.storageKey);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as PersistedAuthSession;
    } catch (error) {
      console.error('AuthSessionService: erro ao ler sessao persistida', error);
      await this.clear();
      return null;
    }
  }

  async clear(): Promise<void> {
    await this.preferencesService.remove(this.storageKey);
  }
}
