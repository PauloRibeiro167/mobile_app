/**
 * REFATORAÇÃO FASE 1: Extrair Responsabilidades (SRP)
 * 
 * Novo arquivo: object-path.utils.ts
 * Responsabilidade ÚNICA: Obter valores aninhados de objetos (centralizar DRY)
 * 
 * Antes: getNestedValue() duplicado em 3+ arquivos
 * Depois: Implementação única, compartilhada
 */

/**
 * Utilitários para acesso a valores aninhados em objetos
 * 
 * ✅ DRY: Centraliza getNestedValue que estava duplicado
 * ✅ KISS: Implementação simples e direta
 * 
 * Uso:
 * ```typescript
 * const user = { profile: { name: 'João', address: { city: 'São Paulo' } } };
 * ObjectPath.get(user, 'profile.name'); // 'João'
 * ObjectPath.get(user, 'profile.address.city'); // 'São Paulo'
 * ObjectPath.get(user, 'profile.phone', 'N/A'); // 'N/A'
 * ```
 */
export class ObjectPath {
  /**
   * Obtém valor de propriedade aninhada usando notação de ponto
   * 
   * @param obj Objeto de origem
   * @param path Caminho em notação de ponto (ex: "user.profile.email")
   * @param defaultValue Valor padrão se caminho não existir
   * @returns Valor encontrado ou defaultValue
   */
  static get<T = any>(
    obj: any,
    path: string | string[],
    defaultValue: T | null = null
  ): T {
    if (!obj || !path) {
      return defaultValue as any;
    }

    // Converter para array se string
    const keys = Array.isArray(path) ? path : path.split('.');

    // Navegar pela estrutura
    let current = obj;
    for (const key of keys) {
      if (current === null || current === undefined) {
        return defaultValue as any;
      }
      current = current[key];
    }

    return current !== undefined ? current : (defaultValue as any);
  }

  /**
   * Define valor em propriedade aninhada (cria estrutura se necessário)
   * 
   * @example
   * ```typescript
   * const obj = {};
   * ObjectPath.set(obj, 'user.profile.name', 'João');
   * // obj = { user: { profile: { name: 'João' } } }
   * ```
   */
  static set(obj: any, path: string | string[], value: any): any {
    if (!obj || !path) {
      return obj;
    }

    const keys = Array.isArray(path) ? path : path.split('.');
    let current = obj;

    // Navegar/criar estrutura até o penúltimo nível
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    // Definir valor
    current[keys[keys.length - 1]] = value;
    return obj;
  }

  /**
   * Verifica se caminho existe no objeto
   */
  static has(obj: any, path: string | string[]): boolean {
    if (!obj || !path) {
      return false;
    }

    const keys = Array.isArray(path) ? path : path.split('.');
    let current = obj;

    for (const key of keys) {
      if (!current || typeof current !== 'object' || !(key in current)) {
        return false;
      }
      current = current[key];
    }

    return true;
  }

  /**
   * Deleta propriedade aninhada
   */
  static delete(obj: any, path: string | string[]): boolean {
    if (!obj || !path) {
      return false;
    }

    const keys = Array.isArray(path) ? path : path.split('.');
    let current = obj;

    // Navegar até o penúltimo nível
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        return false;
      }
      current = current[key];
    }

    // Deletar propriedade
    const lastKey = keys[keys.length - 1];
    if (lastKey in current) {
      delete current[lastKey];
      return true;
    }

    return false;
  }

  /**
   * Obtém todas as chaves de um objeto recursivamente
   * 
   * @example
   * ```typescript
   * const obj = { a: { b: 1, c: { d: 2 } } };
   * ObjectPath.allKeys(obj);
   * // ['a', 'a.b', 'a.c', 'a.c.d']
   * ```
   */
  static allKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];

    if (!obj || typeof obj !== 'object') {
      return keys;
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        keys.push(fullKey);

        // Recursivo para objetos aninhados
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          keys.push(...this.allKeys(obj[key], fullKey));
        }
      }
    }

    return keys;
  }

  /**
   * Extrai valores de múltiplos caminhos de uma vez
   * 
   * @example
   * ```typescript
   * const obj = { user: { name: 'João', email: 'joao@example.com' } };
   * ObjectPath.getMany(obj, ['user.name', 'user.email']);
   * // { 'user.name': 'João', 'user.email': 'joao@example.com' }
   * ```
   */
  static getMany(obj: any, paths: string[]): Record<string, any> {
    const result: Record<string, any> = {};

    for (const path of paths) {
      result[path] = this.get(obj, path);
    }

    return result;
  }
}
