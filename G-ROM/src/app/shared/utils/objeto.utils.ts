export function obterValorAninhado(obj: any, caminho: string): any {
  if (!obj || !caminho) return undefined;
  return caminho.split('.').reduce((atual, chave) => atual?.[chave], obj);
}

/**
 * Define valor aninhado usando notação de ponto
 * Cria estrutura intermediária se necessário
 * 
 * @param obj Objeto alvo
 * @param caminho Caminho em notação de ponto
 * @param valor Valor a definir
 */
export function definirValorAninhado(obj: any, caminho: string, valor: any): void {
  if (!obj || !caminho) return;
  
  const chaves = caminho.split('.');
  const ultimaChave = chaves.pop();
  
  if (!ultimaChave) return;
  
  const alvo = chaves.reduce((atual, chave) => {
    if (!atual[chave]) atual[chave] = {};
    return atual[chave];
  }, obj);
  
  alvo[ultimaChave] = valor;
}

/**
 * Verifica se valor aninhado existe
 * 
 * @param obj Objeto source
 * @param caminho Caminho em notação de ponto
 */
export function temValorAninhado(obj: any, caminho: string): boolean {
  return obterValorAninhado(obj, caminho) !== undefined;
}

/**
 * Cria uma cópia profunda de um objeto (simples)
 * Para objetos complexos com funções, use bibliotecas especializadas
 */
export function copiarProfundamente<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
