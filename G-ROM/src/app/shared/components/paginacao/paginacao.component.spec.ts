import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginacaoComponent } from './paginacao.component';

describe('PaginacaoComponent', () => {
  let component: PaginacaoComponent;
  let fixture: ComponentFixture<PaginacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginacaoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('Propriedades padrão', () => {
    it('deve ter valores padrão corretos', () => {
      expect(component.items).toEqual([]);
      expect(component.currentPage).toBe(1);
      expect(component.itemsPerPage).toBe(10);
      expect(component.itemsPerPageOptions).toEqual([10, 20, 50, 100]);
      expect(component.isActionSheetOpen).toBe(false);
      expect(component.actionSheetButtons).toEqual([]);
    });
  });

  describe('Propriedades calculadas', () => {
    beforeEach(() => {
      component.items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
      component.itemsPerPage = 10;
      component.currentPage = 1;
    });

    it('deve calcular totalPages corretamente', () => {
      expect(component.totalPages).toBe(3);
    });

    it('deve calcular startItem corretamente', () => {
      expect(component.startItem).toBe(1);
    });

    it('deve calcular endItem corretamente', () => {
      expect(component.endItem).toBe(10);
    });

    it('deve calcular startItem e endItem para página intermediária', () => {
      component.currentPage = 2;
      expect(component.startItem).toBe(11);
      expect(component.endItem).toBe(20);
    });

    it('deve calcular endItem para última página', () => {
      component.currentPage = 3;
      expect(component.startItem).toBe(21);
      expect(component.endItem).toBe(25);
    });
  });

  describe('getVisiblePages', () => {
    it('deve retornar array de páginas correto', () => {
      component.items = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }));
      component.itemsPerPage = 10;

      const pages = component.getVisiblePages();
      expect(pages).toEqual([1, 2, 3, 4, 5]);
    });

    it('deve retornar array vazio quando não há itens', () => {
      component.items = [];
      component.itemsPerPage = 10;

      const pages = component.getVisiblePages();
      expect(pages).toEqual([]);
    });
  });

  describe('shouldShowNumericButtons', () => {
    it('deve mostrar botões numéricos para poucas páginas', () => {
      component.items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
      component.itemsPerPage = 10; // 3 páginas

      expect(component.shouldShowNumericButtons()).toBe(true);
    });

    it('não deve mostrar botões numéricos para 50+ itens por página', () => {
      component.itemsPerPage = 50;

      expect(component.shouldShowNumericButtons()).toBe(false);
    });

    it('não deve mostrar botões numéricos para muitas páginas', () => {
      component.items = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));
      component.itemsPerPage = 10; // 10 páginas

      expect(component.shouldShowNumericButtons()).toBe(false);
    });
  });

  describe('shouldShowPageIndicator', () => {
    it('deve mostrar indicador quando não há botões numéricos e há múltiplas páginas', () => {
      component.items = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }));
      component.itemsPerPage = 10; // 5 páginas

      expect(component.shouldShowPageIndicator()).toBe(true);
    });

    it('não deve mostrar indicador quando há botões numéricos', () => {
      component.items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
      component.itemsPerPage = 10; // 3 páginas

      expect(component.shouldShowPageIndicator()).toBe(false);
    });

    it('não deve mostrar indicador quando há apenas 1 página', () => {
      component.items = Array.from({ length: 5 }, (_, i) => ({ id: i + 1 }));
      component.itemsPerPage = 10; // 1 página

      expect(component.shouldShowPageIndicator()).toBe(false);
    });
  });

  describe('changePage', () => {
    beforeEach(() => {
      spyOn(component.pageChange, 'emit');
      component.items = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }));
      component.itemsPerPage = 10; // 5 páginas
    });

    it('deve emitir pageChange para página válida', () => {
      component.changePage(3);

      expect(component.pageChange.emit).toHaveBeenCalledWith(3);
    });

    it('não deve emitir pageChange para página inválida (muito baixa)', () => {
      component.changePage(0);

      expect(component.pageChange.emit).not.toHaveBeenCalled();
    });

    it('não deve emitir pageChange para página inválida (muito alta)', () => {
      component.changePage(10);

      expect(component.pageChange.emit).not.toHaveBeenCalled();
    });
  });

  describe('changeItemsPerPage', () => {
    beforeEach(() => {
      component.items = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));
      component.currentPage = 5;
    });

    it('deve emitir itemsPerPageChange para 10 itens', () => {
      spyOn(component.itemsPerPageChange, 'emit');
      component.changeItemsPerPage(10);

      expect(component.itemsPerPageChange.emit).toHaveBeenCalledWith(10);
    });

    it('deve emitir itemsPerPageChange para 20 itens', () => {
      spyOn(component.itemsPerPageChange, 'emit');
      component.changeItemsPerPage(20);

      expect(component.itemsPerPageChange.emit).toHaveBeenCalledWith(20);
    });

    it('deve emitir itemsPerPageChange para 50 itens', () => {
      spyOn(component.itemsPerPageChange, 'emit');
      component.changeItemsPerPage(50);

      expect(component.itemsPerPageChange.emit).toHaveBeenCalledWith(50);
    });

    it('deve emitir itemsPerPageChange para 100 itens', () => {
      spyOn(component.itemsPerPageChange, 'emit');
      component.changeItemsPerPage(100);

      expect(component.itemsPerPageChange.emit).toHaveBeenCalledWith(100);
    });

    it('deve ajustar página quando página atual excede total de páginas', () => {
      spyOn(component.pageChange, 'emit');
      component.items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 })); // 25 itens
      component.currentPage = 5; // página 5 com 10 itens por página (50 itens total)

      component.changeItemsPerPage(10); // muda para 10 itens, total de páginas = 3

      expect(component.pageChange.emit).toHaveBeenCalledWith(1); // vai para primeira página válida
    });

    it('deve ajustar página para 50 itens', () => {
      spyOn(component.pageChange, 'emit');
      component.changeItemsPerPage(50);

      expect(component.pageChange.emit).toHaveBeenCalledWith(1);
    });

    it('deve ajustar página para 100 itens', () => {
      spyOn(component.pageChange, 'emit');
      component.changeItemsPerPage(100);

      expect(component.pageChange.emit).toHaveBeenCalledWith(1);
    });
  });

  describe('openItemsPerPageActionSheet', () => {
    beforeEach(() => {
      component.itemsPerPage = 20;
    });

    it('deve configurar actionSheetButtons corretamente', () => {
      component.openItemsPerPageActionSheet();

      expect(component.actionSheetButtons.length).toBe(5); // 4 opções + cancelar
      expect(component.actionSheetButtons[1].selected).toBe(true); // 20 itens selecionado
      expect(component.actionSheetButtons[1].text).toBe('20 itens por página');
      expect(component.isActionSheetOpen).toBe(true);
    });

    it('deve marcar a opção correta como selecionada', () => {
      component.itemsPerPage = 50;
      component.openItemsPerPageActionSheet();

      expect(component.actionSheetButtons[2].selected).toBe(true);
      expect(component.actionSheetButtons[2].text).toBe('50 itens por página');
    });
  });

  describe('onActionSheetDismiss', () => {
    it('deve fechar o action sheet', () => {
      component.isActionSheetOpen = true;

      component.onActionSheetDismiss({});

      expect(component.isActionSheetOpen).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('deve chamar updatePaginatedItems', () => {
      spyOn(component.paginatedItemsChange, 'emit');

      component.ngOnInit();

      expect(component.paginatedItemsChange.emit).toHaveBeenCalledWith([]);
    });
  });

  describe('ngOnChanges', () => {
    beforeEach(() => {
      spyOn(component.paginatedItemsChange, 'emit');
    });

    it('deve atualizar itens quando items mudam', () => {
      component.items = [{ id: 1 }, { id: 2 }];

      component.ngOnChanges({
        items: {
          currentValue: component.items,
          previousValue: [],
          firstChange: false,
          isFirstChange: () => false
        }
      });

      expect(component.paginatedItemsChange.emit).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    });

    it('deve atualizar itens quando currentPage muda', () => {
      component.items = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));
      component.currentPage = 2;

      component.ngOnChanges({
        currentPage: {
          currentValue: 2,
          previousValue: 1,
          firstChange: false,
          isFirstChange: () => false
        }
      });

      expect(component.paginatedItemsChange.emit).toHaveBeenCalledWith([
        { id: 11 }, { id: 12 }, { id: 13 }, { id: 14 }, { id: 15 },
        { id: 16 }, { id: 17 }, { id: 18 }, { id: 19 }, { id: 20 }
      ]);
    });

    it('deve atualizar itens quando itemsPerPage muda', () => {
      component.items = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));
      component.itemsPerPage = 5;

      component.ngOnChanges({
        itemsPerPage: {
          currentValue: 5,
          previousValue: 10,
          firstChange: false,
          isFirstChange: () => false
        }
      });

      expect(component.paginatedItemsChange.emit).toHaveBeenCalledWith([
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }
      ]);
    });
  });

  describe('Event Emitters', () => {
    it('deve ter pageChange como EventEmitter', () => {
      expect(component.pageChange).toBeTruthy();
    });

    it('deve ter itemsPerPageChange como EventEmitter', () => {
      expect(component.itemsPerPageChange).toBeTruthy();
    });

    it('deve ter paginatedItemsChange como EventEmitter', () => {
      expect(component.paginatedItemsChange).toBeTruthy();
    });
  });
});
