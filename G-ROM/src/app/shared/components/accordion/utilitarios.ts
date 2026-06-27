import type { CampoAcordion } from './types';

/**
 * Obtém valor aninhado usando notação de ponto
 * Ex: obterValor(obj, "pessoa.nome.primeiro")
 */
export function obterValor(obj: any, caminho: string): any {
  if (!obj || !caminho) return undefined;
  return caminho.split('.').reduce((atual, chave) => atual?.[chave], obj);
}

/**
 * Define valor aninhado usando notação de ponto
 */
export function definirValor(obj: any, caminho: string, valor: any): void {
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
 * Filtra campos vazios
 */
export function filtrarCamposVazios(campos: CampoAcordion[], dados: any): CampoAcordion[] {
  return campos.filter(campo => {
    const valor = obterValor(dados, campo.key || campo.id);
    return valor !== null && valor !== undefined && valor !== '';
  });
}

/**
 * Agrupa campos por tipo
 */
export function agruparCamposPorTipo(campos: CampoAcordion[], tipo: string): CampoAcordion[] {
  const palavrasChave: Record<string, string[]> = {
    'area': ['area', 'terreno', 'edificada', 'fato'],
    'endereco': ['endereco', 'numero', 'complemento', 'logradouro'],
    'caracteristica': ['cartografia', 'ocupacao', 'situacao', 'topografia'],
    'proprietario': ['proprietario', 'titular', 'responsavel']
  };

  const palavras = palavrasChave[tipo] || [];
  
  return campos.filter(campo => {
    const id = campo.id.toLowerCase();
    const label = campo.label?.toLowerCase() || '';
    return palavras.some(p => id.includes(p) || label.includes(p));
  });
}

/**
 * Organiza campos em linhas (para grids)
 */
export function organizarEmLinhas(campos: CampoAcordion[], colunasPerRow: number): CampoAcordion[][] {
  const linhas: CampoAcordion[][] = [];
  
  for (let i = 0; i < campos.length; i += colunasPerRow) {
    linhas.push(campos.slice(i, i + colunasPerRow));
  }
  
  return linhas;
}

/**
 * Filtra campos por grupo
 */
export function filtrarPorGrupo(campos: CampoAcordion[], grupo: string): CampoAcordion[] {
  return campos.filter(c => c.grupo === grupo);
}

/**
 * TrackBy para loops de performance
 */
export function rastreamentoCampo(index: number, campo: CampoAcordion): string {
  return campo.id;
}
