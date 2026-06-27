// Utilitário para formatação de data relativa

export function formatarDataRelativa(data: Date): string {
  const agora = new Date();
  const diferenca = agora.getTime() - data.getTime();
  const minutos = Math.floor(diferenca / (1000 * 60));
  const horas = Math.floor(diferenca / (1000 * 60 * 60));
  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));

  if (minutos < 1) return 'Agora mesmo';
  if (minutos < 60) return `${minutos} min atrás`;
  if (horas < 24) return `${horas}h atrás`;
  if (dias < 7) return `${dias} dias atrás`;
  return data.toLocaleDateString('pt-BR');
}


// ela ta duplicada aqui e dentro da pagina de busca, correção para fazer o import desse metodo