import { Injectable, inject } from '@angular/core';
import type { TipoDocumento, BuscaRecente } from '@utils';

// ===== CONSTANTES =====
const STORAGE_KEYS = {
  APP_DATA: 'appData',
  USER_DATA: 'userData',
  SEARCH_DATA: 'searchData'
} as const;

// ===== INTERFACES =====
export interface AppData {
  theme: 'light' | 'dark';
  language?: string;
  version?: string;
}

export interface UserData {
  loggedUser?: {
    nome: string;
    email: string;
  };
  rememberedUser?: {
    email: string;
    rememberMe: boolean;
  };
}

export interface SearchData {
  currentSearch?: {
    inscricao?: string;
    cpfCnpj?: string;
  };
  selectedInscricao?: any;
  recentSearches: BuscaRecente[];
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Erro ao ler ${key} do localStorage:`, error);
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
  }

  private remove(key: string): void {
    localStorage.removeItem(key);
  }

  // ===== DADOS DO APP =====
  getAppData(): AppData {
    return this.get(STORAGE_KEYS.APP_DATA, { theme: 'light' });
  }

  setAppData(data: Partial<AppData>): void {
    const current = this.getAppData();
    this.set(STORAGE_KEYS.APP_DATA, { ...current, ...data });
  }

  getTheme(): 'light' | 'dark' {
    return this.getAppData().theme;
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.setAppData({ theme });
  }

  // ===== DADOS DO USUÁRIO =====
  getUserData(): UserData {
    return this.get(STORAGE_KEYS.USER_DATA, {});
  }

  setUserData(data: Partial<UserData>): void {
    const current = this.getUserData();
    this.set(STORAGE_KEYS.USER_DATA, { ...current, ...data });
  }

  getLoggedUser(): UserData['loggedUser'] {
    return this.getUserData().loggedUser;
  }

  setLoggedUser(user: UserData['loggedUser']): void {
    this.setUserData({ loggedUser: user });
  }

  getRememberedUser(): UserData['rememberedUser'] {
    return this.getUserData().rememberedUser;
  }

  setRememberedUser(user: UserData['rememberedUser']): void {
    this.setUserData({ rememberedUser: user });
  }

  // ===== DADOS DE BUSCA =====
  getSearchData(): SearchData {
    return this.get(STORAGE_KEYS.SEARCH_DATA, { recentSearches: [] });
  }

  setSearchData(data: Partial<SearchData>): void {
    const current = this.getSearchData();
    this.set(STORAGE_KEYS.SEARCH_DATA, { ...current, ...data });
  }

  getCurrentSearch(): SearchData['currentSearch'] {
    return this.getSearchData().currentSearch;
  }

  setCurrentSearch(search: SearchData['currentSearch']): void {
    this.setSearchData({ currentSearch: search });
  }

  getSelectedInscricao(): SearchData['selectedInscricao'] {
    return this.getSearchData().selectedInscricao;
  }

  setSelectedInscricao(inscricao: SearchData['selectedInscricao']): void {
    this.setSearchData({ selectedInscricao: inscricao });
  }

  // ===== BUSCAS RECENTES =====
  loadRecentSearches(): BuscaRecente[] {
    // Primeiro tenta carregar da nova estrutura
    const searchData = this.getSearchData();
    if (searchData.recentSearches?.length > 0) {
      return searchData.recentSearches.map((busca: any) => ({
        ...busca,
        data: new Date(busca.data)
      }));
    }

    // Fallback para a estrutura antiga
    const buscasSalvas = localStorage.getItem('buscasRecentes');
    if (!buscasSalvas) return [];

    const buscas = JSON.parse(buscasSalvas).map((busca: any) => ({
      ...busca,
      data: new Date(busca.data)
    }));

    // Migra para a nova estrutura
    this.setSearchData({ recentSearches: buscas });
    this.remove('buscasRecentes'); 

    return buscas;
  }

  saveRecentSearches(buscas: BuscaRecente[]): void {
    this.setSearchData({ recentSearches: buscas });
  }

  clearRecentSearches(): void {
    this.setSearchData({ recentSearches: [] });
  }

  addRecentSearch(buscas: BuscaRecente[], novaBusca: BuscaRecente, max: number): BuscaRecente[] {
    const filtradas = buscas.filter(
      (busca) => !(busca.tipo === novaBusca.tipo && busca.valor === novaBusca.valor)
    );
    filtradas.unshift(novaBusca);
    const result = filtradas.slice(0, max);

    this.saveRecentSearches(result);
    return result;
  }

  // ===== MIGRAÇÃO E LIMPEZA =====
  migrateLegacyData(): void {

    // Migra tema
    const oldTheme = localStorage.getItem('app-theme');
    if (oldTheme) {
      this.setTheme(oldTheme as 'light' | 'dark');
      this.remove('app-theme');
    }

    // Migra dados do usuário
    const oldUser = localStorage.getItem('usuarioLogado');
    const oldRemembered = localStorage.getItem('rememberedUser');

    if (oldUser || oldRemembered) {
      const userData: UserData = {};
      if (oldUser) {
        userData.loggedUser = JSON.parse(oldUser);
        this.remove('usuarioLogado');
      }
      if (oldRemembered) {
        userData.rememberedUser = JSON.parse(oldRemembered);
        this.remove('rememberedUser');
      }
      this.setUserData(userData);
    }

    // Migra dados de busca
    const oldCurrentSearch = localStorage.getItem('currentSearch');
    const oldSelectedInscricao = localStorage.getItem('dadosInscricaoSelecionada');

    if (oldCurrentSearch || oldSelectedInscricao) {
      const searchData: Partial<SearchData> = {};
      if (oldCurrentSearch) {
        searchData.currentSearch = JSON.parse(oldCurrentSearch);
        this.remove('currentSearch');
      }
      if (oldSelectedInscricao) {
        searchData.selectedInscricao = JSON.parse(oldSelectedInscricao);
        this.remove('dadosInscricaoSelecionada');
      }
      this.setSearchData(searchData);
    }

  }

  // ===== UTILITÁRIOS =====
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => this.remove(key));
  }

  getStorageSize(): { used: number; available: number } {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Estimativa de espaço disponível (5MB é comum)
    const available = 5 * 1024 * 1024 - used;

    return { used, available };
  }

  logStorageContents(): void {
    console.group('📦 LocalStorage Contents');
    Object.values(STORAGE_KEYS).forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
      }
    });
    console.groupEnd();
  }

  // ===== MÉTODO PARA DESENVOLVIMENTO =====
  /**
   * Método para executar migração via console do navegador
   * Uso: angular.getComponent(document.body).injector.get(LocalStorageService).runMigrationFromConsole()
   */
  runMigrationFromConsole(): void {
    this.migrateLegacyData();
    this.logStorageContents();
  }
}