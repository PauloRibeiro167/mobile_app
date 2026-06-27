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
      import('./screens/login/login.page').then((m) => m.LoginPage),
    data: { animation: 'loginPage' },
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./screens/dashboard/dashboard.page').then((m) => m.HomePage),
    providers: [provideHttpClient()],
    data: { animation: 'homePage' },
    canActivate: [AuthGuard],
  },
  {
    path: 'config',
    loadComponent: () =>
      import('./screens/config/config.page').then((m) => m.ConfigPage),
    data: { animation: 'configPage' },
    canActivate: [AuthGuard],
  },
  {
    path: 'meu-perfil',
    loadComponent: () =>
      import('./screens/perfil/perfil.page').then((m) => m.PerfilPage),
    data: { animation: 'perfilPage' },
    canActivate: [AuthGuard],
  },
  {
    path: 'pdv',
    loadComponent: () =>
      import('./screens/pdv/pdv.page').then((m) => m.PdvPage),
    canActivate: [AuthGuard, pdvAccessGuard],
  },
  {
    path: 'historico',
    loadComponent: () =>
      import('./screens/historico/historico.page').then((m) => m.HistoricoPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'estoque',
    loadComponent: () =>
      import('./screens/estoque/estoque.page').then((m) => m.EstoquePage),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
