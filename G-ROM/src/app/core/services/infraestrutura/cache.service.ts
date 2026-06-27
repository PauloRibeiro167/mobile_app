import { Injectable } from '@angular/core';
import { InscricaoResponse } from '@core/models';
import { InscricaoResponseCpfCnpj } from '@core/models';

// Tipo union para aceitar ambos os tipos de resposta
type AnyInscricaoResponse = InscricaoResponse | InscricaoResponseCpfCnpj;

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresIn: number;
}

interface SearchParams {
  inscricao?: string;
  cpfCnpj?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; 
  constructor() {
  }

  /**
   * Gera uma chave única para os parâmetros de busca
   */
  private generateKey(params: SearchParams): string {
    const key = `${params.inscricao || ''}_${params.cpfCnpj || ''}`;
    return key;
  }

  /**
   * Verifica se um cache é válido (não expirou)
   */
  private isValid(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < entry.expiresIn;
  }

  /**
   * Armazena dados da listagem de inscrições no cache
   */
  setListagemCache(params: SearchParams, data: AnyInscricaoResponse, expiresIn: number = this.DEFAULT_EXPIRY): void {
    const key = this.generateKey(params);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiresIn
    };
    
    this.cache.set(key, entry);
  }

  /**
   * Recupera dados da listagem do cache se estiverem válidos
   */
  getListagemCache(params: SearchParams): AnyInscricaoResponse | null {
    const key = this.generateKey(params);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (!this.isValid(entry)) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Remove uma entrada específica do cache
   */
  removeListagemCache(params: SearchParams): void {
    const key = this.generateKey(params);
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Remove entradas expiradas do cache
   */
  cleanup(): void {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValid(entry)) {
        this.cache.delete(key);
        removedCount++;
      }
    }
  }

  /**
   * Retorna informações sobre o cache
   */
  getCacheInfo(): { totalEntries: number; validEntries: number } {
    let validEntries = 0;
    
    for (const entry of this.cache.values()) {
      if (this.isValid(entry)) {
        validEntries++;
      }
    }
    
    return {
      totalEntries: this.cache.size,
      validEntries
    };
  }
}