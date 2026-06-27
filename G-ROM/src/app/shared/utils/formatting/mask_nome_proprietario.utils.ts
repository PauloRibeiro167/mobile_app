export function mascararNome(nome: string | undefined): string {
  if (!nome || typeof nome !== 'string' || nome.trim().length === 0) return 'Não informado';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) {
    // Para um nome, mostra primeiros 5 caracteres + ****
    return partes[0].substring(0, 5) + '****';
  }
  if (partes.length === 2) {
    // Para dois nomes
    const primeiro = partes[0].substring(0, 5) + '****';
    const ultimo = '** ***' + partes[1].substring(Math.max(0, partes[1].length - 3));
    return `${primeiro} ${ultimo}`;
  }
  // Para três ou mais nomes
  const primeiro = partes[0].substring(0, 5) + '****';
  const nomesDoMeio = partes.slice(1, -1).map(() => '********').join(' ');
  const ultimo = '** ***' + partes[partes.length - 1].substring(Math.max(0, partes[partes.length - 1].length - 3));
  return `${primeiro} ${nomesDoMeio} ${ultimo}`;
}