import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PreferencesService } from '../infraestrutura/preferences.service';

export interface Usuario {
  nome: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'usuarioLogado';
  private readonly preferencesService = inject(PreferencesService);
  private usuarioLogadoSubject = new BehaviorSubject<Usuario | null>(null);
  usuarioLogado$ = this.usuarioLogadoSubject.asObservable();
  private initializationPromise: Promise<void>;

  constructor() {
    this.initializationPromise = this.loadUsuarioPersistido();
  }

  async initialize(): Promise<void> {
    await this.initializationPromise;
  }

  isAuthenticated(): boolean {
    return !!this.usuarioLogadoSubject.getValue();
  }

  getUsuarioLogado(): Usuario | null {
    return this.usuarioLogadoSubject.getValue();
  }

  login(email: string, senha: string): Promise<boolean> {
    // Simula uma chamada de API assíncrona
    return new Promise(resolve => {
      setTimeout(() => {
        if (email === 'teste@teste.com' && senha === '123456') {
          const usuario = { nome: 'Usuário Teste', email };
          this.usuarioLogadoSubject.next(usuario);
          void this.setUsuarioPersistido(usuario);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  }

  logout(): void {
    this.usuarioLogadoSubject.next(null);
    void this.removeUsuarioPersistido();
    sessionStorage.removeItem('dashboard:intro-cards-visible');
  }

  private async loadUsuarioPersistido(): Promise<void> {
    const usuario = await this.getUsuarioPersistido();
    this.usuarioLogadoSubject.next(usuario);
  }

  private async setUsuarioPersistido(usuario: Usuario): Promise<void> {
    await this.preferencesService.setJson(this.storageKey, usuario);
  }

  private async getUsuarioPersistido(): Promise<Usuario | null> {
    const usuario = await this.preferencesService.getString(this.storageKey);

    if (usuario) {
      try {
        return JSON.parse(usuario);
      } catch (error) {
        console.error('AuthService: erro ao ler usuario persistido', error);
        await this.removeUsuarioPersistido();
        return null;
      }
    }

    return null;
  }

  private async removeUsuarioPersistido(): Promise<void> {
    await this.preferencesService.remove(this.storageKey);
  }
}
