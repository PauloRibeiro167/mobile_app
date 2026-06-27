import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, mergeMap, of } from 'rxjs';

export interface RegisterOpeningMockResponse {
  status: 'sucesso';
  aberturaIdPrefixo: string;
  statusCaixa: 'ABERTO';
  caixaId: string;
  horarioPrevistoAbertura: string;
  horarioPrevistoFechamento: string;
  mensagemSistema: string;
  latenciaMs?: number;
}

@Injectable({
  providedIn: 'root',
})
export class RegisterOpeningApiService {
  private readonly http = inject(HttpClient);
  private readonly mockUrl = 'assets/mocks/pdv/register-opening-response.json';

  solicitarAbertura(payload: {
    caixaId: string;
    operadorId: string;
    operadorNome: string;
    horarioAbertura: string;
    fundoTroco: number;
    observacoes: string;
    origemAcesso: string;
  }): Observable<RegisterOpeningMockResponse> {
    return this.http
      .get<RegisterOpeningMockResponse>(this.mockUrl)
      .pipe(
        mergeMap((response) =>
          of({
            ...response,
            caixaId: response.caixaId || payload.caixaId,
          }).pipe(delay(response.latenciaMs ?? 250))
        )
      );
  }
}
