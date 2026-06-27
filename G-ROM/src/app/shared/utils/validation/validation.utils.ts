import { formatDocumentValue,validarCpfCnpj,SearchForm,formatInscricaoInput,validarInscricao,extractNumbers as extractInscricaoNumbers,formatInscricaoForService } from '@utils';
import { AlertType } from '@components';

export function getValidationErrors(form: SearchForm, showValidationAlertFn: (type: AlertType, message: string, data?: any) => void): string[] {
  const erros: string[] = [];
  const { cpfCnpj, inscricaoImobiliaria } = form;

  // Validação de CPF/CNPJ
  const cpfCnpjFormatado = formatDocumentValue(cpfCnpj);
  form.cpfCnpj = cpfCnpjFormatado;
  if (cpfCnpjFormatado.trim() && !validarCpfCnpj(cpfCnpjFormatado)) {
    showValidationAlertFn('error', 'CPF/CNPJ inválido');
    erros.push('CPF/CNPJ inválido');
  }

  // Validação de Inscrição Imobiliária
  const inscricaoFormatada = formatInscricaoForService(inscricaoImobiliaria);
  form.inscricaoImobiliaria = inscricaoFormatada;
  if (inscricaoFormatada.trim()) {
    const apenasNumeros = extractInscricaoNumbers(inscricaoFormatada);
    if (apenasNumeros.length < 2 || apenasNumeros.length > 7) {
      showValidationAlertFn('error', 'Inscrição Imobiliária deve ter 2-7 dígitos');
      erros.push('Inscrição Imobiliária deve ter 2-7 dígitos');
    } else if (!validarInscricao(inscricaoFormatada)) {
      showValidationAlertFn('error', 'Inscrição Imobiliária inválida');
      erros.push('Inscrição Imobiliária inválida');
    }
  }

  // Pelo menos um campo obrigatório
  if (!cpfCnpjFormatado.trim() && !inscricaoFormatada.trim()) {
    showValidationAlertFn('warning', 'Preencha pelo menos um campo');
    erros.push('Preencha pelo menos um campo');
  }

  return erros;
}
