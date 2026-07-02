// Serviços de infraestrutura
export { CacheService } from './infraestrutura/cache.service';
export { LocalStorageService } from './infraestrutura/local-storage.service';
export { PreferencesService } from './infraestrutura/preferences.service';
export { DataMigrationService } from './infraestrutura/data-migration.service';

// Serviços de navegação
export { NavigationService, PageInfo } from './navegacao/navigation.service';
export { GeocodingService } from './navegacao/geocoding.service';

// Serviços de autenticação
export { AuthService } from './auth/auth.service';
export { AccessControlService } from './auth/access-control.service';
export { AuthApiService } from './auth/auth-api.service';
export { AuthMockService } from './auth/auth-mock.service';
export { AuthSessionService } from './auth/auth-session.service';
export { AuthUserContextService } from './auth/auth-user-context.service';
export { PermissionService } from './auth/permission.service';
export { ProfileManagementService } from './auth/profile-management.service';
export { ScopeService } from './auth/scope.service';
export type {
  AppViewDefinition,
  AuthSession,
  AuthSessionUser,
  MockProfileDefinition,
  MockUserDefinition,
  PermissionScope,
} from '../models/access-control.models';

// ============================================
// Serviços de UI (Reorganizados por Feature)
// ============================================

// Temas - Gerenciamento de tema claro/escuro
export { ThemeService } from './UI/temas';

// Área Segura - Insets para notch, statusbar, etc
export { SafeAreaService, SafeAreaInsets } from './UI/area-segura';

// Modal - Orquestração de modais
export { ModalService, ModalType, ModalEvent, ModalFocusField } from './UI/modal';

// Inicialização - Ciclo de vida e setup da aplicação
export { AppInitializationService, AppLifecycleService } from './UI/inicializacao';

// Re-export dos serviços de API
export * from './api/index';
