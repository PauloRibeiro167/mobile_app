// Serviços organizados por API
// export { DadosCadastraisService } from './dados-cadastrais/dados-cadastrais.service';
// export { DadosListService } from './dados-list/dados-list.service';
export * from './dashboard/register-closing/register-closing.service';
export * from './dashboard/register-closing/register-closing-check.service';
export * from './dashboard/register-closing/register-closing-review.service';
export * from './dashboard/register-closing/register-closing-manager-notification.service';
export * from '@domains/gestao-caixa/types/register-opening.types';
export * from '@domains/gestao-caixa/types/register-closing.types';
export * from '@domains/gestao-caixa/services/register-opening.service';
export * from '@domains/gestao-caixa/services/register-session.service';
export * from './dashboard/recent-sales/recent-sales.service';
export * from './dashboard/recent-sales/models';
export * from './dashboard/recent-sales/daily-sales-performance.service';
export * from './dashboard/recent-sales/recent-sales-view-preferences.service';
export * from '@domains/pdv/types/pdv.types';
export * from '@domains/pdv/services/pdv-access.service';
export * from '@domains/pdv/services/pdv-cart.service';
export * from '@domains/pdv/services/pdv-checkout.service';
export * from '@domains/pdv/services/pdv-catalog.service';
export * from '@domains/pdv/services/pdv-sale-submission.service';

// Re-export dos models para facilitar importações
export * from '@core/models';
export * from '@core/models/resultado-de-inscricao.model';
export * from '@core/models/listagem-de-inscricoes.model';
