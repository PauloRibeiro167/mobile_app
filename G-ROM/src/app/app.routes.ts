import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { provideHttpClient } from '@angular/common/http';
import { pdvAccessGuard } from './core/guards/pdv-access.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./domains/autenticacao/pages/login/login.page').then((m) => m.LoginPage),
    data: { animation: 'loginPage' },
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./domains/relatorios/pages/dashboard/dashboard.page').then((m) => m.HomePage),
    providers: [provideHttpClient()],
    data: { animation: 'homePage', requiredViewId: 'relatorios.dashboard' },
    canActivate: [AuthGuard, permissionGuard],
  },
  {
    path: 'config',
    loadComponent: () =>
      import('./domains/configuracoes/pages/config/config.page').then((m) => m.ConfigPage),
    data: { animation: 'configPage', requiredViewId: 'configuracoes.aparencia' },
    canActivate: [AuthGuard, permissionGuard],
  },
  {
    path: 'meu-perfil',
    loadComponent: () =>
      import('./domains/configuracoes/pages/perfil/perfil.page').then((m) => m.PerfilPage),
    data: { animation: 'perfilPage', requiredViewId: 'configuracoes.meu-perfil' },
    canActivate: [AuthGuard, permissionGuard],
  },
  {
    path: 'pdv',
    loadComponent: () =>
      import('./domains/pdv/pages/pdv/pdv.page').then((m) => m.PdvPage),
    canActivate: [AuthGuard, permissionGuard, pdvAccessGuard],
    data: { requiredViewId: 'pdv.operacao' },
  },
  {
    path: 'historico',
    loadComponent: () =>
      import('./domains/vendas/pages/historico/historico.page').then((m) => m.HistoricoPage),
    canActivate: [AuthGuard, permissionGuard],
    data: { requiredViewId: 'vendas.historico' },
  },
  {
    path: 'estoque',
    loadComponent: () =>
      import('./domains/estoque/pages/estoque/estoque.page').then((m) => m.EstoquePage),
    canActivate: [AuthGuard, permissionGuard],
    data: { requiredViewId: 'estoque.visao-geral' },
  },
  {
    path: 'rh',
    loadComponent: () =>
      import('./domains/rh/pages/visao-geral/rh.page').then((m) => m.RhPage),
    canActivate: [AuthGuard, permissionGuard],
    data: { requiredViewId: 'rh.visao-geral' },
  },
  {
    path: 'financeiro',
    loadComponent: () =>
      import('./domains/financeiro/pages/visao-geral/financeiro.page').then((m) => m.FinanceiroPage),
    canActivate: [AuthGuard, permissionGuard],
    data: { requiredViewId: 'financeiro.visao-geral' },
  },
  {
    path: 'gestao-caixa',
    loadComponent: () =>
      import('./domains/gestao-caixa/pages/visao-geral/gestao-caixa.page').then(
        (m) => m.GestaoCaixaPage
      ),
    canActivate: [AuthGuard, permissionGuard],
    data: { requiredViewId: 'gestao-caixa.visao-geral' },
  },
  {
    path: 'admin/acessos',
    loadComponent: () =>
      import('./domains/admin/pages/acessos/acessos.page').then((m) => m.AcessosPage),
    canActivate: [AuthGuard, permissionGuard],
    data: { requiredViewId: 'admin.acessos' },
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
