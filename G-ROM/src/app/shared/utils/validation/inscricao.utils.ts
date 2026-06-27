// Utilitários para máscara e validação de Inscrição Imobiliária

export const INSCRICAO_LENGTH = 7; // 7 dígitos

/**
 * Remove todos os caracteres não numéricos
 */
export function extractNumbers(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Formata a inscrição imobiliária no padrão: 000000-0
 */
export function formatInscricao(valor: string): string {
  const apenasNumeros = extractNumbers(valor);
  
  if (apenasNumeros.length === 0) {
    return '';
  }
  
  if (apenasNumeros.length <= 6) {
    return apenasNumeros;
  }
  
  // Formato: 000000-0
  return apenasNumeros.replace(/^(\d{6})(\d{1})$/, '$1-$2');
}

/**
 * Valida se a inscrição tem o formato correto (2-7 dígitos)
 */
export function validarFormatoInscricao(inscricao: string): boolean {
  const apenasNumeros = extractNumbers(inscricao);
  return apenasNumeros.length >= 2 && apenasNumeros.length <= INSCRICAO_LENGTH;
}

/**
 * Valida a inscrição imobiliária (formato mais permissivo)
 */
export function validarInscricao(inscricao: string): boolean {
  const apenasNumeros = extractNumbers(inscricao);
  
  // Verificação básica de formato - permite 2-7 dígitos (já que será formatado)
  if (apenasNumeros.length < 2 || apenasNumeros.length > INSCRICAO_LENGTH) {
    return false;
  }
  
  // Verificação se não são todos números iguais (apenas se tiver 7 dígitos)
  if (apenasNumeros.length === INSCRICAO_LENGTH && /^(\d)\1{6}$/.test(apenasNumeros)) {
    return false;
  }
  
  // Por enquanto, apenas validação de formato
  return true;
}

/**
 * Formata a inscrição aplicando a máscara durante a digitação
 * Último dígito como verificador, anteriores como sequência.
 */
export function formatInscricaoInput(valor: string): string {
  const digits = extractNumbers(valor);
  if (!digits) return '';

  const verificador = digits[digits.length - 1];
  let numeros = digits.slice(0, -1);
  // Remove zeros à esquerda
  numeros = numeros.replace(/^0+/, '');
  if (!numeros && digits.length === 1) {
    numeros = '0';
  }

  return `${numeros}-${verificador}`;
}

/**
 * Classe para gerenciar máscara de inscrição imobiliária com acumulação progressiva
 */
export class InscricaoMask {
  private raw: string = '';

  /**
   * Formata o valor com o último dígito como verificador
   * e os anteriores compondo os 6 números, sem zeros à esquerda.
   */
  format(value: string): string {
    // Extrai apenas números
    const digits = value.replace(/\D/g, ''); // sem limite aqui
    if (!digits) return '';

    // Último número sempre é o dígito verificador
    const verificador = digits[digits.length - 1];

    // Os anteriores são a sequência principal
    let numeros = digits.slice(0, -1);

    // Remove zeros à esquerda
    numeros = numeros.replace(/^0+/, '');

    // Se vazio após remover zeros, usa "0" apenas se for o caso de 1 dígito total
    if (!numeros && digits.length === 1) {
      numeros = '0';
    }

    this.raw = (numeros === '0' ? '' : numeros) + verificador;

    // Retorna no formato NNNNNN-D (ou menos se não 6)
    return `${numeros}-${verificador}`;
  }

  /**
   * Retorna os dígitos "crus" (sem máscara).
   */
  getRaw(): string {
    return this.raw;
  }

  /**
   * Reseta o estado da máscara
   */
  reset(): void {
    this.raw = '';
  }
}

/**
 * Formata a inscrição para envio ao service, completando com zeros à esquerda
 * Formato: 000000-0 (7 dígitos no total)
 */
export function formatInscricaoForService(valor: string): string {
  const apenasNumeros = extractNumbers(valor);
  
  if (apenasNumeros.length === 0) {
    return '';
  }
  
  // Completa com zeros à esquerda para ter exatamente 7 dígitos
  const padded = apenasNumeros.padStart(INSCRICAO_LENGTH, '0');
  
  // Formato: 000000-0
  return padded.replace(/^(\d{6})(\d{1})$/, '$1-$2');
}
