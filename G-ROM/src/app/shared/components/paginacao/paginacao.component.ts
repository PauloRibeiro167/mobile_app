import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton } from '@ionic/angular/standalone';
import { CustomActionSheetComponent, ActionSheetButton } from '../custom-action-sheet/custom-action-sheet.component';

@Component({
  selector: 'app-paginacao',
  templateUrl: './paginacao.component.html',
  styleUrl: './paginacao.component.css',
  standalone: true,
  imports: [CommonModule, IonButton, CustomActionSheetComponent],
})
export class PaginacaoComponent implements OnInit, OnChanges {
  @Input() items: any[] = [];
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 10;
  @Input() itemsPerPageOptions: number[] = [10, 20, 50, 100];
  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();
  @Output() paginatedItemsChange = new EventEmitter<any[]>();

  isActionSheetOpen: boolean = false;
  actionSheetButtons: ActionSheetButton[] = [];

  constructor() {}

  ngOnInit() {
    this.updatePaginatedItems();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items'] || changes['currentPage'] || changes['itemsPerPage']) {
      this.updatePaginatedItems();
    }
  }

  private updatePaginatedItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const paginated = this.items.slice(start, start + this.itemsPerPage);
    this.paginatedItemsChange.emit(paginated);
  }

  get totalPages(): number {
    return Math.ceil(this.items.length / this.itemsPerPage);
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.items.length);
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  shouldShowNumericButtons(): boolean {
    // Para 50 itens ou mais por página, sempre usar indicador
    if (this.itemsPerPage >= 50) return false;
    
    // Em dispositivos móveis, seja mais restritivo com os botões numéricos
    // Mostra botões numéricos apenas quando há muito poucas páginas
    if (this.totalPages <= 3) return true;
    
    // Para mais páginas, sempre use o indicador para evitar quebra de layout
    return false;
  }

  shouldShowPageIndicator(): boolean {
    // Mostra indicador quando não está mostrando botões numéricos e há mais de 1 página
    return !this.shouldShowNumericButtons() && this.totalPages > 1;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  changeItemsPerPage(newItemsPerPage: number) {
    // Emite o evento primeiro
    this.itemsPerPageChange.emit(newItemsPerPage);
    
    // Aplica tratamento específico baseado na quantidade selecionada
    switch (newItemsPerPage) {
      case 10:
        this.handlePaginationChange(newItemsPerPage, 'small');
        break;
      case 20:
        this.handlePaginationChange(newItemsPerPage, 'medium');
        break;
      case 50:
        this.handlePaginationChange(newItemsPerPage, 'large');
        break;
      case 100:
        this.handlePaginationChange(newItemsPerPage, 'extra-large');
        break;
      default:
        this.handlePaginationChange(newItemsPerPage, 'custom');
        break;
    }
  }

  private handlePaginationChange(itemsPerPage: number, size: 'small' | 'medium' | 'large' | 'extra-large' | 'custom') {
    // Calcula o novo total de páginas
    const newTotalPages = Math.ceil(this.items.length / itemsPerPage);
    
    // Determina a página ideal baseada no tamanho
    let targetPage = 1;
    
    switch (size) {
      case 'small': // 10 itens - mantém posição relativa se possível
        if (this.currentPage <= newTotalPages) {
          targetPage = this.currentPage;
        }
        break;
        
      case 'medium': // 20 itens - vai para página equivalente ou primeira válida
        targetPage = Math.max(1, Math.min(Math.ceil(this.currentPage / 2), newTotalPages));
        break;
        
      case 'large': // 50 itens - calcula posição proporcional
        targetPage = Math.max(1, Math.min(Math.ceil(this.currentPage / 5), newTotalPages));
        break;
        
      case 'extra-large': // 100 itens - primeira página na maioria dos casos
        targetPage = Math.max(1, Math.min(Math.ceil(this.currentPage / 10), newTotalPages));
        break;
        
      default: // custom - vai para primeira página
        targetPage = 1;
        break;
    }
    
    // Emite mudança de página se necessário
    if (targetPage !== this.currentPage && newTotalPages > 0) {
      this.pageChange.emit(targetPage);
    }
  }

  openItemsPerPageActionSheet() {
    this.actionSheetButtons = this.itemsPerPageOptions.map(option => {
      const isSelected = option === this.itemsPerPage;
      
      return {
        text: `${option} itens por página`,
        icon: isSelected ? 'check-circle' : 'circle',
        selected: isSelected,
        handler: () => {
          this.changeItemsPerPage(option);
        }
      };
    });

    this.actionSheetButtons.push({
      text: 'Cancelar',
      icon: 'x-circle-fill',
      role: 'cancel',
      handler: () => {
        // Fecha o modal sem fazer nada
      }
    });

    this.isActionSheetOpen = true;
  }

  onActionSheetDismiss(event: any) {
    this.isActionSheetOpen = false;
  }
}
