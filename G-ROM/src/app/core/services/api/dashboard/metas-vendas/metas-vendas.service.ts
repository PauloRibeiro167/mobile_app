import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface MetaVenda {
  id: 'diaria' | 'mensal';
  titulo: string;
  periodo: string;
  valorAtual: string;
  valorMeta: string;
  progresso: number;
  segmentos: SegmentoMetaVenda[];
}

export interface SegmentoMetaVenda {
  label: string;
  valor: string;
  cor: string;
}

@Injectable({
  providedIn: 'root',
})
export class MetasVendasService {
  private readonly metas: MetaVenda[] = [
    {
      id: 'diaria',
      titulo: 'Diaria',
      periodo: 'Hoje',
      valorAtual: '1.250,00',
      valorMeta: '2.000,00',
      progresso: 62.5,
      segmentos: [
        { label: 'PIX', valor: '420,00', cor: '#83fc8e' },
        { label: 'Crédito', valor: '310,00', cor: '#66df75' },
        { label: 'Débito', valor: '285,00', cor: '#28a745' },
        { label: 'Dinheiro', valor: '235,00', cor: '#c4f36b' },
      ],
    },
    {
      id: 'mensal',
      titulo: 'Mensal',
      periodo: 'Junho',
      valorAtual: '28.400,00',
      valorMeta: '45.000,00',
      progresso: 63.1,
      segmentos: [
        { label: 'PIX', valor: '9.850,00', cor: '#83fc8e' },
        { label: 'Crédito', valor: '7.420,00', cor: '#66df75' },
        { label: 'Débito', valor: '6.380,00', cor: '#28a745' },
        { label: 'Dinheiro', valor: '4.750,00', cor: '#c4f36b' },
      ],
    },
  ];

  getMetas(): Observable<MetaVenda[]> {
    return of(this.metas);
  }
}
