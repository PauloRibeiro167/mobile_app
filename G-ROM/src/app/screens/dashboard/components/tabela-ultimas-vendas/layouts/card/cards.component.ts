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
  selector: 'app-recent-sales-cards-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cards.component.html',
})
export class CardsComponent {
  @Input({ required: true }) vendas: VendaRecenteViewModel[] = [];
  @Output() selecionarVenda = new EventEmitter<VendaRecenteViewModel>();

  readonly trackByVenda = trackByVenda;
  readonly obterClasseLinhaPagamento = obterClasseLinhaPagamento;
  readonly obterClasseTituloPagamento = obterClasseTituloPagamento;
  readonly obterIconePagamento = obterIconePagamento;

  abrirDetalhesVenda(venda: VendaRecenteViewModel): void {
    this.selecionarVenda.emit(venda);
  }
}
