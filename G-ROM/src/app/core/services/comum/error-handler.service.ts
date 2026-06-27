import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private errorMessages: { [key: string]: string } = {
    'NETWORK_ERROR': 'Erro de conexão. Verifique sua internet.',
    'REQUIRED': 'Este campo é obrigatório.',
    'INVALID_EMAIL': 'E-mail inválido.',
    'UNKNOWN': 'Ocorreu um erro inesperado. Tente novamente.'
  };
  // preciso melhorar os tratemtendo e tipos de mensagens assim como criação de testes.
  getErrorMessage(code: string): string {
    return this.errorMessages[code] || this.errorMessages['UNKNOWN'];
  }

  handle(error: any): string {
    // Exemplo: fazer adptação de acordo com o teste
    if (error.status === 0) {
      return this.getErrorMessage('NETWORK_ERROR');
    }
    if (error.error && error.error.code) {
      return this.getErrorMessage(error.error.code);
    }
    return this.getErrorMessage('UNKNOWN');
  }
}
