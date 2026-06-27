import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { VendaRecenteViewModel } from '@services/api/dashboard/recent-sales/models/recent-sales.models';
import {
  obterClasseLinhaPagamento,
  obterClasseTituloPagamento,
  obterIconePagamento,
  trackByVenda,
} from '../../utils';

@Component({
  selector: 'app-recent-sales-grid-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid.component.html',
})
export class GridComponent {
  @Input({ required: true }) vendas: VendaRecenteViewModel[] = [];
  @Output() selecionarVenda = new EventEmitter<VendaRecenteViewModel>();

  readonly trackByVenda = trackByVenda;
  readonly obterClasseLinhaPagamento = obterClasseLinhaPagamento;
  readonly obterClasseTituloPagamento = obterClasseTituloPagamento;
  readonly obterIconePagamento = obterIconePagamento;
  readonly gridTemplateColumns = 'repeat(auto-fit, minmax(min(100%, 10.75rem), 1fr))';

  abrirDetalhesVenda(venda: VendaRecenteViewModel): void {
    this.selecionarVenda.emit(venda);
  }
}
