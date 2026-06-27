import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { APP_VERSION } from '../../../constants/app-version';

export interface Venda {
  id: string;
  data: string;
  valor: string;
  status: string;
}

export interface DashboardData {
  caixaStatus: string;
  caixaTurno: string;
  vendasTurno: string;
  carrinhoItens: number;
  metaDiaria: string;
  metaDiariaProgresso: number;
  estoqueBaixo: number;
  ticketMedio: string;
  tendenciaVendas: string;
  ultimasVendas: Venda[];
  appVersao: string;
  appUpdateUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor() {}

  getDashboardData(): Observable<DashboardData> {
    return of({
      caixaStatus: 'CAIXA ABERTO',
      caixaTurno: 'TURNO MANHÃ',
      vendasTurno: '1.250,00',
      tendenciaVendas: '+8.5% desde ontem',
      carrinhoItens: 3,
      metaDiaria: '2.000,00',
      metaDiariaProgresso: 62.5,
      estoqueBaixo: 5,
      ticketMedio: '45,00',
      appVersao: APP_VERSION,
      appUpdateUrl: 'https://mercadinho-app.com/download',
      ultimasVendas: [
        { id: '#ORD-092', data: '10:45 AM', valor: '125,50', status: 'Concluído' },
        { id: '#ORD-091', data: '10:32 AM', valor: '45,00', status: 'Processando' },
        { id: '#ORD-090', data: '10:15 AM', valor: '89,90', status: 'Concluído' }
      ]
    });
  }
}
