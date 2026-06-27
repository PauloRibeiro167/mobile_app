import { SearchForm } from '@utils';

export function hasFormData(form: SearchForm): boolean {
  const { cpfCnpj, inscricaoImobiliaria } = form;
  return Boolean(cpfCnpj.trim() || inscricaoImobiliaria.trim());
}

export function clearForm(form: SearchForm): void {
  form.cpfCnpj = '';
  form.inscricaoImobiliaria = '';
}
