
export interface CampoAcordion {
  id: string;
  rotulo: string;
  valor: any;
  icone?: string;
  sufixo?: string;
  tipo?: 'texto' | 'imagens'; // Define o tipo de campo
  imagens?: Array<{
    id?: number;
    url: string;
    descricao?: string;
    tipo?: string;
  }>; // Array de imagens para carrossel (quando tipo === 'imagens')
}

/** Seção (grupo de campos) do accordion */
export interface SecaoAcordion {
  id: string;
  titulo: string;
  layout: 'grid-2x2' | 'grid-2x2-icons' | 'coluna-unica' | 'misto' | 'colunas-agrupadas' | 'cartoes-agrupados' | 'carrossel-imagens';
  campos: CampoAcordion[];
  subsecoes?: SecaoAcordion[];
}

/** Dados completos para renderização do accordion */
export interface DadosAcordion {
  secoes: SecaoAcordion[];
  permitirMultiplosExpandidos?: boolean;
  secoesPadraoExpandidas?: string[];
}
