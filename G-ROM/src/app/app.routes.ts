import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { provideHttpClient } from '@angular/common/http';
import { pdvAccessGuard } from './core/guards/pdv-access.guard';

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
    data: { animation: 'homePage' },
    canActivate: [AuthGuard],
  },
  {
    path: 'config',
    loadComponent: () =>
      import('./domains/configuracoes/pages/config/config.page').then((m) => m.ConfigPage),
    data: { animation: 'configPage' },
    canActivate: [AuthGuard],
  },
  {
    path: 'meu-perfil',
    loadComponent: () =>
      import('./domains/configuracoes/pages/perfil/perfil.page').then((m) => m.PerfilPage),
    data: { animation: 'perfilPage' },
    canActivate: [AuthGuard],
  },
  {
    path: 'pdv',
    loadComponent: () =>
      import('./domains/pdv/pages/pdv/pdv.page').then((m) => m.PdvPage),
    canActivate: [AuthGuard, pdvAccessGuard],
  },
  {
    path: 'historico',
    loadComponent: () =>
      import('./domains/vendas/pages/historico/historico.page').then((m) => m.HistoricoPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'estoque',
    loadComponent: () =>
      import('./domains/estoque/pages/estoque/estoque.page').then((m) => m.EstoquePage),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
