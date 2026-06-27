import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { AuthService, PreferencesService } from '@services';

import { RegisterClosingService } from './register-closing.service';
import { RegisterOpeningService } from '../register-opening/register-opening.service';

describe('RegisterClosingService', () => {
  let service: RegisterClosingService;
  let authService: AuthService;
  let registerOpeningService: RegisterOpeningService;
  let preferencesServiceSpy: jasmine.SpyObj<PreferencesService>;

  beforeEach(async () => {
    preferencesServiceSpy = jasmine.createSpyObj('PreferencesService', [
      'getString',
      'setJson',
      'remove',
    ]);
    preferencesServiceSpy.getString.and.resolveTo(null);
    preferencesServiceSpy.setJson.and.resolveTo();
    preferencesServiceSpy.remove.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        { provide: PreferencesService, useValue: preferencesServiceSpy }
      ]
    });

    service = TestBed.inject(RegisterClosingService);
    authService = TestBed.inject(AuthService);
    registerOpeningService = TestBed.inject(RegisterOpeningService);
    await authService.initialize();
    await registerOpeningService.initialize();
  });

  it('deve expor os jsons base de payload e response para os testes', () => {
    expect(service.fixtures.payloadExemplo.caixaId).toBe('12345');
    expect(service.fixtures.payloadExemplo.valoresInformados.cartaoCredito).toBe(
      1200
    );
    expect(service.fixtures.responseExemplo.resumo.cartaoCredito.diferenca).toBe(
      -50
    );
    expect(service.fixtures.responseExemplo.resultadoFinal).toBe(
      'QUEBRA_DE_CAIXA'
    );
    expect(service.fixtures.responseExemplo.detalhesOperacionais.quantidadeVendas).toBe(28);
  });

  it('deve montar o payload usando o operador logado quando existir', async () => {
    await authService.login('teste@teste.com', '123456');

    const payload = service.buildPayload(450.5, 'Fechamento do turno da tarde.');

    expect(payload.caixaId).toBe('12345');
    expect(payload.operadorId).toBe('teste@teste.com');
    expect(payload.observacoes).toBe('Fechamento do turno da tarde.');
    expect(payload.valoresInformados.cartaoCredito).toBe(1250);
    expect(payload.valoresInformados.cartaoDebito).toBe(850);
    expect(payload.valoresInformados.pix).toBe(300);
  });

  it('deve retornar fechamento sem divergencia quando os valores batem', async () => {
    const payload = service.buildPayload(service.getExpectedValues().dinheiro, '');

    const response = await firstValueFrom(service.submitBlindClosing(payload));

    expect(response.resultadoFinal).toBe('FECHADO_SEM_DIVERGENCIA');
    expect(response.resumo.dinheiro.status).toBe('BATEU');
    expect(response.resumo.cartaoCredito.status).toBe('BATEU');
    expect(response.resumo.cartaoDebito.status).toBe('BATEU');
    expect(response.resumo.pix.status).toBe('BATEU');
  });

  it('deve acusar quebra de caixa quando houver falta ou sobra', async () => {
    const payload = service.buildPayload(
      430.5,
      'Diferença encontrada no dinheiro contado.'
    );

    const response = await firstValueFrom(service.submitBlindClosing(payload));

    expect(response.resultadoFinal).toBe('QUEBRA_DE_CAIXA');
    expect(response.resumo.dinheiro.status).toBe('FALTA');
    expect(response.resumo.dinheiro.diferenca).toBe(-20);
    expect(response.resumo.cartaoCredito.status).toBe('BATEU');
    expect(response.resumo.cartaoDebito.status).toBe('BATEU');
    expect(response.resumo.pix.status).toBe('BATEU');
  });

  it('deve montar a nota de fechamento com dados operacionais do turno', async () => {
    const payload = service.buildPayload(450.5, 'Caixa conferido sem ressalvas.');
    const response = await firstValueFrom(service.submitBlindClosing(payload));

    const nota = service.buildClosingNote(payload, response);

    expect(nota.protocolo).toBe(response.fechamentoId);
    expect(nota.quantidadeVendas).toBe(28);
    expect(nota.turno).toBe('Turno manhã');
    expect(nota.valoresInformados.dinheiro).toBe(450.5);
    expect(nota.observacoes).toBe('Caixa conferido sem ressalvas.');
  });
});
