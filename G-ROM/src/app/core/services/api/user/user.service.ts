import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface UserProfile {
  nome: string;
  cargo: string;
  turno: string;
  status: 'online' | 'offline' | 'ausente';
  id?: string;
  isVerificado?: boolean;
  avatarUrl?: string;
  telefone?: string;
  departamento?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor() {}

  /**
   * Simula a busca dos dados do usuário logado
   */
  getUserProfile(): Observable<UserProfile> {
    return of({
      id: 'FF-88291',
      nome: 'José Paulo',
      cargo: 'OPERADOR',
      turno: 'TURNO MANHÃ',
      status: 'online',
      isVerificado: true,
      telefone: '(11) 99999-9999',
      departamento: 'Vendas',
      // Gerando avatar dinâmico baseado no nome
      avatarUrl:
        'https://ui-avatars.com/api/?name=Admin&background=00ff88&color=064e3b&bold=true',
    });
  }
}
