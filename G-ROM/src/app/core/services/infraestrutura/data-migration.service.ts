import { Injectable, inject } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class DataMigrationService {
  private localStorageService = inject(LocalStorageService);

  migrateIfNeeded(): void {
    const hasLegacyKeys = [
      'app-theme',
      'usuarioLogado',
      'rememberedUser',
      'currentSearch',
      'dadosInscricaoSelecionada',
      'buscasRecentes'
    ].some(key => localStorage.getItem(key) !== null);

    if (hasLegacyKeys) {
      this.localStorageService.migrateLegacyData();
    }
  }
}