import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { AuthService, PreferencesService } from '@services';

import { RegisterOpeningService } from './register-opening.service';
import {
  RegisterOpeningApiService,
  RegisterOpeningMockResponse,
} from './register-opening-api.service';

describe('RegisterOpeningService', () => {
  let service: RegisterOpeningService;
  let authService: AuthService;
  let preferencesServiceSpy: jasmine.SpyObj<PreferencesService>;
  let registerOpeningApiServiceSpy: jasmine.SpyObj<RegisterOpeningApiService>;
  const mockResponse: RegisterOpeningMockResponse = {
    status: 'sucesso',
    aberturaIdPrefixo: 'abx-mock',
    statusCaixa: 'ABERTO',
    caixaId: '12345',
    horarioPrevistoAbertura: '07:00',
    horarioPrevistoFechamento: '22:00',
    mensagemSistema: 'Abertura simulada para testes.',
    latenciaMs: 0,
  };

  beforeEach(async () => {
    preferencesServiceSpy = jasmine.createSpyObj('PreferencesService', [
      'getString',
      'setJson',
      'remove',
    ]);
    registerOpeningApiServiceSpy = jasmine.createSpyObj(
      'RegisterOpeningApiService',
      ['solicitarAbertura']
    );
    preferencesServiceSpy.getString.and.resolveTo(null);
    preferencesServiceSpy.setJson.and.resolveTo();
    preferencesServiceSpy.remove.and.resolveTo();
    registerOpeningApiServiceSpy.solicitarAbertura.and.returnValue(
      of(mockResponse)
    );

    TestBed.configureTestingModule({
      providers: [
        { provide: PreferencesService, useValue: preferencesServiceSpy },
        {
          provide: RegisterOpeningApiService,
          useValue: registerOpeningApiServiceSpy,
        },
      ]
    });

    service = TestBed.inject(RegisterOpeningService);
    authService = TestBed.inject(AuthService);
    await authService.initialize();
    await service.initialize();
    service.resetAbertura();
  });

  it('deve registrar a abertura com operador, fundo de troco e horario previsto', async () => {
    await authService.login('teste@teste.com', '123456');

    const response = await firstValueFrom(
      service.solicitarAbertura(
        80,
        'Abertura do caixa da manhã.',
        new Date('2026-06-13T07:05:00-03:00')
      )
    );

    expect(response.operadorId).toBe('teste@teste.com');
    expect(response.fundoTroco).toBe(80);
    expect(response.horarioPrevistoAbertura).toBe('07:00');
    expect(response.horarioPrevistoFechamento).toBe('22:00');
    expect(response.houveAtraso).toBeFalse();
    expect(preferencesServiceSpy.setJson).toHaveBeenCalled();
  });

  it('deve identificar atraso acima da tolerancia configurada', () => {
    const payload = service.buildPayload(
      50,
      'Abertura atrasada.',
      new Date('2026-06-13T07:25:00-03:00'),
      'direct-route'
    );

    const response = service.registrarAbertura(payload, mockResponse);

    expect(response.houveAtraso).toBeTrue();
    expect(response.minutosAtraso).toBe(25);
  });

  it('deve bloquear o fechamento enquanto o caixa nao for aberto', () => {
    const disponibilidade = service.getClosingAvailability(
      new Date('2026-06-13T21:59:00-03:00')
    );

    expect(disponibilidade.podeFechar).toBeFalse();
    expect(disponibilidade.aberturaRealizada).toBeFalse();
  });

  it('deve liberar o fechamento somente no horario configurado', async () => {
    await firstValueFrom(
      service.solicitarAbertura(
        50,
        'Abertura em horario regular.',
        new Date('2026-06-13T07:00:00-03:00'),
        'direct-route'
      )
    );

    const antes = service.getClosingAvailability(
      new Date('2026-06-13T21:59:00-03:00')
    );
    const depois = service.getClosingAvailability(
      new Date('2026-06-13T22:00:00-03:00')
    );

    expect(antes.podeFechar).toBeFalse();
    expect(depois.podeFechar).toBeTrue();
  });
});
