import { TestBed } from '@angular/core/testing';
import { AuthService, Usuario } from './auth.service';
import { PreferencesService } from '../infraestrutura/preferences.service';

describe('AuthService', () => {
  let service: AuthService;
  let preferencesServiceSpy: jasmine.SpyObj<PreferencesService>;

  beforeEach(async () => {
    preferencesServiceSpy = jasmine.createSpyObj('PreferencesService', ['getString', 'setJson', 'remove']);
    preferencesServiceSpy.getString.and.resolveTo(null);
    preferencesServiceSpy.setJson.and.resolveTo();
    preferencesServiceSpy.remove.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: PreferencesService, useValue: preferencesServiceSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    await service.initialize();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve iniciar sem usuário logado', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('deve fazer login com credenciais válidas', async () => {
    const email = 'teste@teste.com';
    const senha = '123456';

    const result = await service.login(email, senha);

    expect(result).toBeTrue();
    expect(service.isAuthenticated()).toBeTrue();

    service.usuarioLogado$.subscribe((usuario) => {
      if (usuario) {
        expect(usuario.email).toBe(email);
        expect(usuario.nome).toBe('Usuário Teste');
      }
    });
  });

  it('deve falhar login com credenciais vazias', async () => {
    const result = await service.login('', '');

    expect(result).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('deve fazer logout com sucesso', async () => {
    await service.login('teste@teste.com', '123456');

    service.logout();
    await Promise.resolve();

    expect(service.isAuthenticated()).toBe(false);
    expect(preferencesServiceSpy.remove).toHaveBeenCalledWith('usuarioLogado');
  });

  it('deve persistir usuário no Preferences', async () => {
    const email = 'teste@teste.com';
    const senha = '123456';

    await service.login(email, senha);

    expect(preferencesServiceSpy.setJson).toHaveBeenCalledWith('usuarioLogado', {
      nome: 'Usuário Teste',
      email
    });
  });

  it('deve carregar usuário salvo do Preferences na inicialização', async () => {
    const usuario: Usuario = {
      nome: 'Usuário Teste',
      email: 'teste@example.com'
    };

    preferencesServiceSpy.getString.and.resolveTo(JSON.stringify(usuario));

    const newService = TestBed.runInInjectionContext(() => new AuthService());
    await newService.initialize();

    expect(newService.isAuthenticated()).toBeTrue();
  });

  it('deve lidar com dados corrompidos do Preferences', async () => {
    preferencesServiceSpy.getString.and.resolveTo('invalid-json');
    spyOn(console, 'error');

    const newService = TestBed.runInInjectionContext(() => new AuthService());
    await newService.initialize();

    expect(newService.isAuthenticated()).toBe(false);
    expect(preferencesServiceSpy.remove).toHaveBeenCalledWith('usuarioLogado');
  });

  it('deve emitir mudanças de usuário através do observable', (done) => {
    service.usuarioLogado$.subscribe((usuario) => {
      if (usuario) {
        expect(usuario.email).toBe('teste@teste.com');
        expect(usuario.nome).toBe('Usuário Teste');
        done();
      }
    });

    service.login('teste@teste.com', '123456');
  });
});
