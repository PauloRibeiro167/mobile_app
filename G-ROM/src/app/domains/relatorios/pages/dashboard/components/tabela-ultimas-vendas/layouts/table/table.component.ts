import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { VendaRecenteViewModel } from '@services/api/dashboard/recent-sales/models/recent-sales.models';
import {
  obterClasseBadgePagamento,
  trackByVenda,
} from '../../utils';

@Component({
  selector: 'app-recent-sales-table-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
})
export class TableComponent {
  @Input({ required: true }) vendas: VendaRecenteViewModel[] = [];
  @Output() selecionarVenda = new EventEmitter<VendaRecenteViewModel>();

  readonly trackByVenda = trackByVenda;
  readonly obterClasseBadgePagamento = obterClasseBadgePagamento;

  abrirDetalhesVenda(venda: VendaRecenteViewModel): void {
    this.selecionarVenda.emit(venda);
  }
}
