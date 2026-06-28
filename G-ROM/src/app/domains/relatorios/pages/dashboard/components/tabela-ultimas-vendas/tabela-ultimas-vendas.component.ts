import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { IonModal } from '@ionic/angular/standalone';
import { RecentSalesService } from '@services/api/dashboard/recent-sales/recent-sales.service';
import {
  PainelVendasRecentesViewModel,
  VendaRecenteViewModel,
} from '@services/api/dashboard/recent-sales/models/recent-sales.models';
import { Observable } from 'rxjs';
import { RecentSalesViewMode, RecentSalesViewPreferencesService, } from '@services/api';
import { CardsComponent, GridComponent, TableComponent,} from './layouts';
import { obterClasseBadgePagamento, obterClasseLinhaPagamento, obterClasseTituloPagamento, obterIconePagamento, trackByVenda,} from './utils';

@Component({
  selector: 'app-tabela-ultimas-vendas',
  standalone: true,
  templateUrl: './tabela-ultimas-vendas.component.html',
  styleUrl: './tabela-ultimas-vendas.component.css',
  imports: [
    CommonModule,
    IonModal,
    TableComponent,
    CardsComponent,
    GridComponent,
  ],
})
export class TabelaUltimasVendasComponent implements OnInit {
  private readonly recentSalesService = inject(RecentSalesService);
  private readonly recentSalesViewPreferencesService = inject(
    RecentSalesViewPreferencesService
  );

  readonly modosVisualizacao: ReadonlyArray<{
    modo: RecentSalesViewMode;
    icone: string;
    ariaLabel: string;
  }> = [
    {
      modo: 'table',
      icone: 'bi-table',
      ariaLabel: 'Visualizar vendas em tabela',
    },
    {
      modo: 'cards',
      icone: 'bi-view-stacked',
      ariaLabel: 'Visualizar vendas em cards',
    },
    {
      modo: 'grid',
      icone: 'bi-grid-3x3-gap',
      ariaLabel: 'Visualizar vendas em grade',
    },
  ];

  readonly painelVendasRecentes$: Observable<PainelVendasRecentesViewModel> =
    this.recentSalesService.getRecentSalesPanel();
  vendaSelecionada: VendaRecenteViewModel | null = null;
  modoVisualizacao: RecentSalesViewMode = 'cards';

  async ngOnInit(): Promise<void> {
    this.modoVisualizacao =
      await this.recentSalesViewPreferencesService.getViewMode();
  }

  readonly trackByVenda = trackByVenda;
  readonly obterClasseBadgePagamento = obterClasseBadgePagamento;
  readonly obterClasseTituloPagamento = obterClasseTituloPagamento;
  readonly obterClasseLinhaPagamento = obterClasseLinhaPagamento;
  readonly obterIconePagamento = obterIconePagamento;

  async definirModoVisualizacao(modo: RecentSalesViewMode): Promise<void> {
    this.modoVisualizacao = modo;
    await this.recentSalesViewPreferencesService.setViewMode(modo);
  }

  abrirDetalhesVenda(venda: VendaRecenteViewModel): void {
    this.vendaSelecionada = venda;
  }

  fecharDetalhesVenda(): void {
    this.vendaSelecionada = null;
  }

  obterClasseBotaoModoVisualizacao(modo: RecentSalesViewMode): string {
    return this.modoVisualizacao === modo
      ? 'border border-[rgba(var(--app-color-primary-rgb),0.3)] bg-[linear-gradient(180deg,rgba(var(--app-color-primary-rgb),0.22),rgba(var(--app-color-primary-rgb),0.12))] text-[var(--app-color-primary-light)] shadow-[0_10px_24px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]'
      : 'border border-transparent bg-transparent text-zinc-400 hover:border-white/8 hover:bg-white/6 hover:text-zinc-100';
  }
}
