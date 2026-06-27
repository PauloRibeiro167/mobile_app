import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';

import { AuthService, PreferencesService } from '@services';
import {
  RegisterOpeningApiService,
  RegisterOpeningMockResponse,
} from './register-opening-api.service';

export type StatusCaixa = 'FECHADO' | 'ABERTO';

export interface FuncionamentoCaixaConfig {
  caixaId: string;
  horarioAbertura: string;
  horarioFechamento: string;
  toleranciaAtrasoMinutos: number;
}

export interface AberturaCaixaPayload {
  caixaId: string;
  operadorId: string;
  operadorNome: string;
  horarioAbertura: string;
  fundoTroco: number;
  observacoes: string;
  origemAcesso: 'quick-actions' | 'bottom-tab-bar' | 'direct-route';
}

export interface AberturaCaixaResponse {
  status: 'sucesso';
  aberturaId: string;
  statusCaixa: 'ABERTO';
  caixaId: string;
  operadorId: string;
  operadorNome: string;
  horarioAbertura: string;
  horarioAberturaFormatado: string;
  horarioPrevistoAbertura: string;
  horarioPrevistoFechamento: string;
  fundoTroco: number;
  observacoes: string;
  origemAcesso: AberturaCaixaPayload['origemAcesso'];
  mensagemSistema: string;
  houveAtraso: boolean;
  minutosAtraso: number;
}

export interface FechamentoLiberacaoCaixa {
  aberturaRealizada: boolean;
  podeFechar: boolean;
  motivo: string;
  horarioPrevistoAbertura: string;
  horarioPrevistoFechamento: string;
  statusCaixa: StatusCaixa;
}

@Injectable({
  providedIn: 'root',
})
export class RegisterOpeningService {
  private readonly authService = inject(AuthService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly registerOpeningApiService = inject(RegisterOpeningApiService);
  private readonly storageKey = 'register-opening-state';
  private initializationPromise: Promise<void>;

  private readonly funcionamentoConfig: FuncionamentoCaixaConfig = {
    caixaId: '12345',
    horarioAbertura: '07:00',
    horarioFechamento: '22:00',
    toleranciaAtrasoMinutos: 10,
  };

  private readonly aberturaSubject =
    new BehaviorSubject<AberturaCaixaResponse | null>(null);

  readonly aberturaAtual$ = this.aberturaSubject.asObservable();

  constructor() {
    this.initializationPromise = this.restoreState();
  }

  async initialize(): Promise<void> {
    await this.initializationPromise;
  }

  buildPayload(
    fundoTroco: number,
    observacoes: string,
    horarioAbertura = new Date(),
    origemAcesso: AberturaCaixaPayload['origemAcesso'] = 'direct-route'
  ): AberturaCaixaPayload {
    const usuarioLogado = this.authService.getUsuarioLogado();

    return {
      caixaId: this.funcionamentoConfig.caixaId,
      operadorId: usuarioLogado?.email ?? 'operador-demo',
      operadorNome: usuarioLogado?.nome ?? 'Operador Demo',
      horarioAbertura: horarioAbertura.toISOString(),
      fundoTroco: this.roundCurrency(fundoTroco),
      observacoes: observacoes.trim() || 'Abertura de caixa sem observações.',
      origemAcesso,
    };
  }

  solicitarAbertura(
    fundoTroco: number,
    observacoes: string,
    horarioAbertura = new Date(),
    origemAcesso: AberturaCaixaPayload['origemAcesso'] = 'direct-route'
  ): Observable<AberturaCaixaResponse> {
    const aberturaAtual = this.getAberturaAtual();

    if (aberturaAtual) {
      return of(aberturaAtual);
    }

    const payload = this.buildPayload(
      fundoTroco,
      observacoes,
      horarioAbertura,
      origemAcesso
    );

    return this.registerOpeningApiService.solicitarAbertura(payload).pipe(
      map((mockResponse) => this.registrarAbertura(payload, mockResponse)),
      tap((response) => {
        void this.persistState(response);
        this.aberturaSubject.next(response);
      })
    );
  }

  registrarAbertura(
    payload: AberturaCaixaPayload,
    mockResponse: RegisterOpeningMockResponse
  ): AberturaCaixaResponse {
    const horarioReal = new Date(payload.horarioAbertura);
    const horarioPrevistoAbertura = this.buildReferenceDate(
      mockResponse.horarioPrevistoAbertura,
      horarioReal
    );
    const horarioPrevistoFechamento = this.buildReferenceDate(
      mockResponse.horarioPrevistoFechamento,
      horarioReal
    );
    const minutosAtraso = Math.max(
      0,
      Math.round(
        (horarioReal.getTime() - horarioPrevistoAbertura.getTime()) / 60000
      )
    );
    const response: AberturaCaixaResponse = {
      status: mockResponse.status,
      aberturaId: `${mockResponse.aberturaIdPrefixo}-${Date.now()}`,
      statusCaixa: mockResponse.statusCaixa,
      caixaId: mockResponse.caixaId || payload.caixaId,
      operadorId: payload.operadorId,
      operadorNome: payload.operadorNome,
      horarioAbertura: payload.horarioAbertura,
      horarioAberturaFormatado: this.formatDateTime(horarioReal),
      horarioPrevistoAbertura: mockResponse.horarioPrevistoAbertura,
      horarioPrevistoFechamento: mockResponse.horarioPrevistoFechamento,
      fundoTroco: this.roundCurrency(payload.fundoTroco),
      observacoes: payload.observacoes,
      origemAcesso: payload.origemAcesso,
      mensagemSistema: mockResponse.mensagemSistema,
      houveAtraso: minutosAtraso > this.funcionamentoConfig.toleranciaAtrasoMinutos,
      minutosAtraso,
    };

    return response;
  }

  getAberturaAtual(): AberturaCaixaResponse | null {
    const aberturaAtual = this.aberturaSubject.getValue();

    if (!aberturaAtual) {
      return null;
    }

    if (!this.isAberturaAtualValida(aberturaAtual)) {
      this.resetAbertura();
      return null;
    }

    return aberturaAtual;
  }

  getFuncionamentoConfig(): FuncionamentoCaixaConfig {
    return this.funcionamentoConfig;
  }

  getClosingAvailability(referenceDate = new Date()): FechamentoLiberacaoCaixa {
    const aberturaAtual = this.getAberturaAtual();

    if (!aberturaAtual) {
      return {
        aberturaRealizada: false,
        podeFechar: false,
        motivo: 'Abra o caixa antes de liberar o fechamento.',
        horarioPrevistoAbertura: this.funcionamentoConfig.horarioAbertura,
        horarioPrevistoFechamento: this.funcionamentoConfig.horarioFechamento,
        statusCaixa: 'FECHADO',
      };
    }

    const horarioLiberadoFechamento = this.buildReferenceDate(
      this.funcionamentoConfig.horarioFechamento,
      referenceDate
    );
    const podeFechar = referenceDate.getTime() >= horarioLiberadoFechamento.getTime();

    return {
      aberturaRealizada: true,
      podeFechar,
      motivo: podeFechar
        ? 'Fechamento liberado conforme o horário de funcionamento.'
        : `Fechamento liberado a partir das ${aberturaAtual.horarioPrevistoFechamento}.`,
      horarioPrevistoAbertura: aberturaAtual.horarioPrevistoAbertura,
      horarioPrevistoFechamento: aberturaAtual.horarioPrevistoFechamento,
      statusCaixa: aberturaAtual.statusCaixa,
    };
  }

  resetAbertura(): void {
    void this.preferencesService.remove(this.storageKey);
    this.aberturaSubject.next(null);
  }

  private async persistState(response: AberturaCaixaResponse): Promise<void> {
    await this.preferencesService.setJson(this.storageKey, response);
  }

  private async restoreState(): Promise<void> {
    const state = await this.preferencesService.getString(this.storageKey);

    if (!state) {
      this.aberturaSubject.next(null);
      return;
    }

    try {
      const abertura = JSON.parse(state) as AberturaCaixaResponse;

      if (!this.isAberturaAtualValida(abertura)) {
        await this.preferencesService.remove(this.storageKey);
        this.aberturaSubject.next(null);
        return;
      }

      this.aberturaSubject.next(abertura);
    } catch {
      await this.preferencesService.remove(this.storageKey);
      this.aberturaSubject.next(null);
    }
  }

  private buildReferenceDate(time: string, referenceDate: Date): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date(referenceDate);

    date.setHours(hours, minutes, 0, 0);

    return date;
  }

  private roundCurrency(value: number): number {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  private isAberturaAtualValida(
    abertura: AberturaCaixaResponse,
    referenceDate = new Date()
  ): boolean {
    const aberturaDate = new Date(abertura.horarioAbertura);

    return this.getBusinessDate(aberturaDate) === this.getBusinessDate(referenceDate);
  }

  private formatDateTime(value: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Fortaleza',
    }).format(value);
  }

  private getBusinessDate(value: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Fortaleza',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(value);
  }

}
