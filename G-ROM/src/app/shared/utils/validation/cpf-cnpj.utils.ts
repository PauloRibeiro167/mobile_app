// Utilitários para máscara e validação de CPF/CNPJ

export const CPF_LENGTH = 11;
export const CNPJ_LENGTH = 14;

export function extractNumbers(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCpf(valor: string): string {
  return valor
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatCnpj(valor: string): string {
  return valor
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function formatDocumentValue(valor: string): string {
  const apenasNumeros = extractNumbers(valor);
  return apenasNumeros.length <= CPF_LENGTH 
    ? formatCpf(apenasNumeros)
    : formatCnpj(apenasNumeros);
}

export function validarCpfCnpj(documento: string): boolean {
  const apenasNumeros = extractNumbers(documento);
  return apenasNumeros.length === CPF_LENGTH 
    ? validarCpf(apenasNumeros)
    : apenasNumeros.length === CNPJ_LENGTH 
      ? validarCnpj(apenasNumeros)
      : false;
}

export function validarCpf(cpf: string): boolean {
  if (cpf.length !== CPF_LENGTH || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  const calcularDigito = (base: string, pesos: number[]): number => {
    const soma = base
      .split('')
      .reduce((acc, digit, index) => acc + parseInt(digit) * pesos[index], 0);
    const resto = (soma * 10) % 11;
    return resto === 10 || resto === 11 ? 0 : resto;
  };
  const primeiroDigito = calcularDigito(cpf.substring(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const segundoDigito = calcularDigito(cpf.substring(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return primeiroDigito === parseInt(cpf.charAt(9)) && 
         segundoDigito === parseInt(cpf.charAt(10));
}

export function validarCnpj(cnpj: string): boolean {
  if (cnpj.length !== CNPJ_LENGTH) return false;
  const calcularDigito = (base: string, sequencia: number[]): number => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += parseInt(base.charAt(i)) * sequencia[i];
    }
    const resultado = soma % 11;
    return resultado < 2 ? 0 : 11 - resultado;
  };
  const primeiroDigito = calcularDigito(cnpj.substring(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const segundoDigito = calcularDigito(cnpj.substring(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return primeiroDigito === parseInt(cnpj.charAt(12)) && 
         segundoDigito === parseInt(cnpj.charAt(13));
}

// Adiciona método determinarTipoDocumento
export function determinarTipoDocumento(valor: string): 'CPF' | 'CNPJ' {
  const apenasNumeros = extractNumbers(valor);
  if (apenasNumeros.length === CPF_LENGTH) return 'CPF';
  if (apenasNumeros.length === CNPJ_LENGTH) return 'CNPJ';
  return apenasNumeros.length <= CPF_LENGTH ? 'CPF' : 'CNPJ';
}

/**
 * Classe para gerenciar máscara de CPF/CNPJ com acumulação progressiva
 */
export class CpfCnpjMask {
  private raw: string = '';

  /**
   * Formata o valor com acumulação progressiva de dígitos
   * @param value Valor atual do input (pode incluir formatação)
   * @returns Valor formatado (ex.: "123.456.789-01" ou "12.345.678/0001-90")
   */
  format(value: string): string {
    let currentDigits = value.replace(/\D/g, '').slice(-14); // Pega os últimos 14 dígitos (máx. CNPJ)
    this.raw = currentDigits; // Sempre atualiza para os últimos dígitos

    return formatDocumentValue(this.raw);
  }

  /**
   * Reseta o estado da máscara
   */
  reset(): void {
    this.raw = '';
  }
}
