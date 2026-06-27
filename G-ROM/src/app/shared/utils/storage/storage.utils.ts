// Utilitários para manipulação de dados no localStorage
import type { TipoDocumento, BuscaRecente } from '@utils';

// ===== CONSTANTES =====
const STORAGE_KEYS = {
  APP_DATA: 'appData',
  USER_DATA: 'userData',
  SEARCH_DATA: 'searchData'
} as const;

// ===== INTERFACES =====
interface AppData {
  theme: 'light' | 'dark';
  language?: string;
  version?: string;
}

interface UserData {
  loggedUser?: {
    nome: string;
    email: string;
  };
  rememberedUser?: {
    email: string;
    rememberMe: boolean;
  };
}

interface SearchData {
  currentSearch?: {
    inscricao?: string;
    cpfCnpj?: string;
  };
  selectedInscricao?: any; // Dados da inscrição selecionada
  recentSearches: BuscaRecente[];
}

// ===== CLASSE GERENCIADORA =====
export class LocalStorageManager {
  // ===== MÉTODOS GERAIS =====
  private static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Erro ao ler ${key} do localStorage:`, error);
      return defaultValue;
    }
  }

  private static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
  }

  private static remove(key: string): void {
    localStorage.removeItem(key);
  }

  // ===== DADOS DO APP =====
  static getAppData(): AppData {
    return this.get(STORAGE_KEYS.APP_DATA, { theme: 'light' });
  }

  static setAppData(data: Partial<AppData>): void {
    const current = this.getAppData();
    this.set(STORAGE_KEYS.APP_DATA, { ...current, ...data });
  }

  static getTheme(): 'light' | 'dark' {
    return this.getAppData().theme;
  }

  static setTheme(theme: 'light' | 'dark'): void {
    this.setAppData({ theme });
  }

  // ===== DADOS DO USUÁRIO =====
  static getUserData(): UserData {
    return this.get(STORAGE_KEYS.USER_DATA, {});
  }

  static setUserData(data: Partial<UserData>): void {
    const current = this.getUserData();
    this.set(STORAGE_KEYS.USER_DATA, { ...current, ...data });
  }

  static getLoggedUser(): UserData['loggedUser'] {
    return this.getUserData().loggedUser;
  }

  static setLoggedUser(user: UserData['loggedUser']): void {
    this.setUserData({ loggedUser: user });
  }

  static getRememberedUser(): UserData['rememberedUser'] {
    return this.getUserData().rememberedUser;
  }

  static setRememberedUser(user: UserData['rememberedUser']): void {
    this.setUserData({ rememberedUser: user });
  }

  // ===== DADOS DE BUSCA =====
  static getSearchData(): SearchData {
    return this.get(STORAGE_KEYS.SEARCH_DATA, { recentSearches: [] });
  }

  static setSearchData(data: Partial<SearchData>): void {
    const current = this.getSearchData();
    this.set(STORAGE_KEYS.SEARCH_DATA, { ...current, ...data });
  }

  static getCurrentSearch(): SearchData['currentSearch'] {
    return this.getSearchData().currentSearch;
  }

  static setCurrentSearch(search: SearchData['currentSearch']): void {
    this.setSearchData({ currentSearch: search });
  }

  static getSelectedInscricao(): SearchData['selectedInscricao'] {
    return this.getSearchData().selectedInscricao;
  }

  static setSelectedInscricao(inscricao: SearchData['selectedInscricao']): void {
    this.setSearchData({ selectedInscricao: inscricao });
  }

  // ===== BUSCAS RECENTES (LEGACY + NOVO) =====
  static loadRecentSearches(): BuscaRecente[] {
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
    this.remove('buscasRecentes'); // Remove a chave antiga

    return buscas;
  }

  static saveRecentSearches(buscas: BuscaRecente[]): void {
    this.setSearchData({ recentSearches: buscas });
  }

  static clearRecentSearches(): void {
    this.setSearchData({ recentSearches: [] });
  }

  static addRecentSearch(buscas: BuscaRecente[], novaBusca: BuscaRecente, max: number): BuscaRecente[] {
    const filtradas = buscas.filter(
      (busca) => !(busca.tipo === novaBusca.tipo && busca.valor === novaBusca.valor)
    );
    filtradas.unshift(novaBusca);
    const result = filtradas.slice(0, max);

    this.saveRecentSearches(result);
    return result;
  }

  // ===== MIGRAÇÃO E LIMPEZA =====
  static migrateLegacyData(): void {
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
  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => this.remove(key));
  }

  static getStorageSize(): { used: number; available: number } {
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

  static logStorageContents(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        // Log contents for debugging
      }
    });
    // Log storage size for debugging
  }
}

// ===== FUNÇÕES LEGACY (para compatibilidade) =====
export function loadRecentSearches(): BuscaRecente[] {
  return LocalStorageManager.loadRecentSearches();
}

export function saveRecentSearches(buscas: BuscaRecente[]): void {
  LocalStorageManager.saveRecentSearches(buscas);
}

export function clearRecentSearches(): void {
  LocalStorageManager.clearRecentSearches();
}

export function addRecentSearch(buscas: BuscaRecente[], novaBusca: BuscaRecente, max: number): BuscaRecente[] {
  return LocalStorageManager.addRecentSearch(buscas, novaBusca, max);
}
