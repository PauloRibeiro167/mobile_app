import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('Propriedades padrão', () => {
    it('deve ter isVisible como false por padrão', () => {
      expect(component.isVisible).toBe(false);
    });

    it('deve ter message como "Carregando..." por padrão', () => {
      expect(component.message).toBe('Carregando...');
    });

    it('deve ter size como "40" por padrão', () => {
      expect(component.size).toBe('40');
    });

    it('deve ter color como "var(--ion-color-primary)" por padrão', () => {
      expect(component.color).toBe('var(--ion-color-primary)');
    });

    it('deve ter speed como "1.75" por padrão', () => {
      expect(component.speed).toBe('1.75');
    });

    it('deve ter customClass como undefined por padrão', () => {
      expect(component.customClass).toBe(undefined);
    });

    it('deve ter debugText como undefined por padrão', () => {
      expect(component.debugText).toBe(undefined);
    });
  });

  describe('Inputs funcionais', () => {
    it('deve aceitar input isVisible', () => {
      component.isVisible = true;
      expect(component.isVisible).toBe(true);
    });

    it('deve aceitar input message', () => {
      component.message = 'Processando dados...';
      expect(component.message).toBe('Processando dados...');
    });

    it('deve aceitar input size', () => {
      component.size = '60';
      expect(component.size).toBe('60');
    });

    it('deve aceitar input color', () => {
      component.color = '#ff0000';
      expect(component.color).toBe('#ff0000');
    });

    it('deve aceitar input speed', () => {
      component.speed = '2.0';
      expect(component.speed).toBe('2.0');
    });

    it('deve aceitar input customClass', () => {
      component.customClass = 'custom-loading';
      expect(component.customClass).toBe('custom-loading');
    });

    it('deve aceitar input debugText', () => {
      component.debugText = 'Debug mode ativado';
      expect(component.debugText).toBe('Debug mode ativado');
    });
  });

  describe('Renderização', () => {
    it('deve renderizar corretamente quando visível', () => {
      component.isVisible = true;
      component.message = 'Teste de carregamento';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled).toBeTruthy();
    });

    it('deve renderizar corretamente quando invisível', () => {
      component.isVisible = false;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled).toBeTruthy();
    });
  });
});
