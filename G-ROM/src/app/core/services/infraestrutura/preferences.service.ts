import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  async getString(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });

    if (value !== null) {
      return value;
    }

    return this.migrateLegacyString(key);
  }

  async setString(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });

    if (this.canUseLocalStorage()) {
      localStorage.removeItem(key);
    }
  }

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });

    if (this.canUseLocalStorage()) {
      localStorage.removeItem(key);
    }
  }

  async getJson<T>(key: string, defaultValue: T): Promise<T> {
    const value = await this.getString(key);

    if (!value) {
      return defaultValue;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`Erro ao ler ${key} do Preferences:`, error);
      await this.remove(key);
      return defaultValue;
    }
  }

  async setJson<T>(key: string, value: T): Promise<void> {
    await this.setString(key, JSON.stringify(value));
  }

  private async migrateLegacyString(key: string): Promise<string | null> {
    if (!this.canUseLocalStorage()) {
      return null;
    }

    const legacyValue = localStorage.getItem(key);

    if (legacyValue === null) {
      return null;
    }

    await Preferences.set({ key, value: legacyValue });
    localStorage.removeItem(key);

    return legacyValue;
  }

  private canUseLocalStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
