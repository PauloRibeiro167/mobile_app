export type AppDomainKey =
  | 'admin'
  | 'configuracoes'
  | 'estoque'
  | 'financeiro'
  | 'gestao-caixa'
  | 'pdv'
  | 'relatorios'
  | 'rh'
  | 'vendas';

export type AppShellKind = 'app' | 'operational' | 'admin';

export interface PermissionScope {
  lojas: string[];
  setores: string[];
  ownOnly: boolean;
}

export interface PermissionRule {
  anyOf?: string[];
  allOf?: string[];
  profilesAnyOf?: string[];
}

export interface AppViewDefinition {
  id: string;
  domain: AppDomainKey;
  title: string;
  description: string;
  route: string;
  icon: string;
  shell: AppShellKind;
  placement: 'menu' | 'tab' | 'hidden';
  section: string;
  access?: PermissionRule;
}

export interface MockProfileDefinition {
  nome: string;
  descricao: string;
  cargoLabel: string;
  permissions: string[];
  landingRoute?: string;
}

export interface MockUserDefinition {
  id: string;
  nome: string;
  email: string;
  password: string;
  cargo: string;
  departamento: string;
  turno: string;
  status: 'online' | 'offline' | 'ausente';
  situacao: string;
  avatarUrl: string;
  profiles: string[];
  additionalPermissions: string[];
  scopes: PermissionScope;
}

export interface AuthSessionUser {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  turno: string;
  status: 'online' | 'offline' | 'ausente';
  situacao: string;
  avatarUrl: string;
}

export interface AuthSession {
  user: AuthSessionUser;
  profileNames: string[];
  profiles: MockProfileDefinition[];
  permissions: string[];
  scopes: PermissionScope;
  availableViews: AppViewDefinition[];
  permissionSources: {
    global: string[];
    profile: string[];
    additional: string[];
    aliases: string[];
  };
}

export interface PersistedAuthSession {
  userId: string;
}
