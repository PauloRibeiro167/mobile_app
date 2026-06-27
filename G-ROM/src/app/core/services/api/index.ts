// Serviços organizados por API
// export { DadosCadastraisService } from './dados-cadastrais/dados-cadastrais.service';
// export { DadosListService } from './dados-list/dados-list.service';
export * from './dashboard/register-closing/register-closing.service';
export * from './dashboard/register-opening/register-opening.service';
export * from './dashboard/register-session/register-session.service';
export * from './dashboard/recent-sales/recent-sales.service';
export * from './dashboard/recent-sales/models';
export * from './dashboard/recent-sales/daily-sales-performance.service';
export * from './dashboard/recent-sales/recent-sales-view-preferences.service';
export * from './pdv/pdv-access.service';
export * from './pdv/pdv-sale-submission.service';

// Re-export dos models para facilitar importações
export * from '@core/models';
export * from '@core/models/resultado-de-inscricao.model';
export * from '@core/models/listagem-de-inscricoes.model';
