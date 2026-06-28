import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';
import {
  MetaVenda,
  SegmentoMetaVenda,
  MetasVendasService,
} from '@core/services/api/dashboard/metas-vendas/metas-vendas.service';
import { map, Observable } from 'rxjs';

interface MetasDashboardView {
  diaria: MetaVenda;
  mensal: MetaVenda | null;
}

@Component({
  selector: 'app-meta-de-vendas',
  standalone: true,
  templateUrl: './meta-de-vendas.component.html',
  styleUrl: './meta-de-vendas.component.css',
  imports: [CommonModule, IonCard, IonCardContent],
})
export class MetaDeVendasComponent {
  private readonly metasVendasService = inject(MetasVendasService);
  private readonly ringRadius = 42;
  readonly ringCircumference = 2 * Math.PI * this.ringRadius;
  isExpanded = false;

  readonly metasDashboard$: Observable<MetasDashboardView> =
    this.metasVendasService.getMetas().pipe(
      map((metas) => {
        const diaria = metas.find((meta) => meta.id === 'diaria') ?? metas[0];
        const mensal = metas.find((meta) => meta.id === 'mensal') ?? null;

        return { diaria, mensal };
      })
    );

  getProgressOffset(meta: MetaVenda): number {
    return this.ringCircumference * (1 - this.getProgressPercent(meta) / 100);
  }

  getProgressPercent(meta: MetaVenda): number {
    return Math.min(Math.max(meta.progresso, 0), 100);
  }

  getProgressoFormatado(meta: MetaVenda): string {
    return `${this.getProgressPercent(meta).toFixed(0)}%`;
  }

  getFaltaFormatada(meta: MetaVenda): string {
    const restante = Math.max(
      this.parseCurrency(meta.valorMeta) - this.parseCurrency(meta.valorAtual),
      0
    );

    return `R$ ${this.formatCurrency(restante)}`;
  }

  getValorAtualFormatado(meta: MetaVenda): string {
    return `R$ ${meta.valorAtual}`;
  }

  getValorMetaFormatado(meta: MetaVenda): string {
    return `R$ ${meta.valorMeta}`;
  }

  getGraficoRosca(meta: MetaVenda): string {
    const total = this.parseCurrency(meta.valorAtual);

    if (total <= 0 || meta.segmentos.length === 0) {
      return 'conic-gradient(rgba(255,255,255,0.08) 0deg 360deg)';
    }

    let start = 0;
    const slices = meta.segmentos.map((segmento) => {
      const valor = this.parseCurrency(segmento.valor);
      const angle = (valor / total) * 360;
      const end = start + angle;
      const slice = `${segmento.cor} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;

      start = end;

      return slice;
    });

    return `conic-gradient(${slices.join(', ')})`;
  }

  getSegmentosVisiveis(meta: MetaVenda): SegmentoMetaVenda[] {
    return meta.segmentos.slice(0, 4);
  }

  getValorSegmentoFormatado(segmento: SegmentoMetaVenda): string {
    return `R$ ${segmento.valor}`;
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  private parseCurrency(value: string): number {
    return Number(value.replace(/\./g, '').replace(',', '.')) || 0;
  }

  private formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
