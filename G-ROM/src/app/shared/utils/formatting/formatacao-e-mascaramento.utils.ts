/**
 * UTILITÁRIOS DE FORMATAÇÃO - Genéricos e Reutilizáveis
 * 
 * ✅ Princípio 2.2 (DRY): Reutilizável em múltiplos domínios
 * ✅ Podem ser usados em qualquer componente que necessite formatar valores
 * ✅ Funções puras sem dependências externas
 * 
 * NOTA: Mascaramento de nomes específico está em mask_nome_proprietario.utils.ts
 *       Formatação de CPF/CNPJ (com máscara visível) está em validation/cpf-cnpj.utils.ts
 */

// ============================================
// FORMATAÇÃO GENÉRICA - Exibir valores adequadamente
// ============================================

/**
 * Formata valor em moeda brasileira
 * Ex: formatarMoeda("1234.56") → "R$ 1.234,56"
 */
export function formatarMoeda(valor: string | number): string {
  const num = typeof valor === 'string' 
    ? parseFloat(valor.replace(/[^0-9.,-]/g, '').replace(',', '.'))
    : valor;
  
  if (isNaN(num)) return String(valor);
  
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(num);
}

/**
 * Formata valor como data
 * Ex: formatarData("2024-01-15") → "15/01/2024"
 */
export function formatarData(valor: string): string {
  try {
    const data = new Date(valor);
    if (isNaN(data.getTime())) return valor;
    return new Intl.DateTimeFormat('pt-BR').format(data);
  } catch {
    return valor;
  }
}

/**
 * Formata número com separadores de milhares
 * Ex: formatarNumero("1234567") → "1.234.567"
 */
export function formatarNumero(valor: string | number): string {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(num)) return String(valor);
  return new Intl.NumberFormat('pt-BR').format(num);
}

/**
 * Formata percentage
 * Ex: formatarPercentual(0.75) → "75%"
 */
export function formatarPercentual(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(valor);
}

/**
 * Converte valor para string formatada com prefixo/sufixo opcionais
 * Ex: formatarComAfixo("100", "R$", "reais") → "R$ 100 reais"
 */
export function formatarComAfixo(valor: string, prefixo?: string, sufixo?: string): string {
  let resultado = valor;
  if (prefixo) resultado = `${prefixo} ${resultado}`;
  if (sufixo) resultado = `${resultado} ${sufixo}`;
  return resultado;
}

// ============================================
// MASCARAMENTO GENÉRICO - Ocultar dados sensíveis
// ============================================

/**
 * Mascara CPF deixando apenas últimos dígitos
 * Ex: "123.456.789-10" → "***.***.***-10"
 * 
 * Genérico para qualquer componente que precise ocultar CPF
 */
export function mascararCpf(cpf: string): string {
  if (!cpf || cpf.length < 5) return '***.***.***-**';
  
  const limpo = cpf.replace(/\D/g, '');
  const ultimos = limpo.slice(-2);
  
  return `***.***.***-${ultimos}`;
}

/**
 * Mascara email deixando primeiro caractere e domínio
 * Ex: "usuario@example.com" → "u***@example.com"
 * 
 * Genérico e reutilizável (não específico do domínio)
 */
export function mascararEmail(email: string): string {
  if (!email || !email.includes('@')) return '****@****';
  
  const [usuario, dominio] = email.split('@');
  const primeiroChar = usuario[0];
  
  return `${primeiroChar}${'*'.repeat(Math.max(1, usuario.length - 1))}@${dominio}`;
}

/**
 * Mascara telefone deixando apenas últimos dígitos
 * Ex: "(11) 98765-4321" → "(11) 9****-4321"
 * 
 * Genérico e reutilizável
 */
export function mascararTelefone(telefone: string): string {
  if (!telefone || telefone.length < 5) return '(##) 9****-****';
  
  const limpo = telefone.replace(/\D/g, '');
  const ddd = limpo.substring(0, 2);
  const ultimos = limpo.slice(-4);
  
  return `(${ddd}) 9****-${ultimos}`;
}
