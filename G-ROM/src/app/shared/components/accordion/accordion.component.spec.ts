import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultadoAccordionComponent } from './accordion.component';
import { SecaoAcordion, CampoAcordion } from './types';

describe('ResultadoAccordionComponent', () => {
  let component: ResultadoAccordionComponent;
  let fixture: ComponentFixture<ResultadoAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadoAccordionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultadoAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('deveRenderizarLayout', () => {
    it('deve retornar true quando o layout coincide', () => {
      const secao = { layout: 'grid-2x2' } as SecaoAcordion;
      expect(component.deveRenderizarLayout(secao, 'grid-2x2')).toBe(true);
    });

    it('deve retornar false quando o layout não coincide', () => {
      const secao = { layout: 'coluna-unica' } as SecaoAcordion;
      expect(component.deveRenderizarLayout(secao, 'grid-2x2')).toBe(false);
    });

    it('deve retornar false quando secao é null', () => {
      expect(component.deveRenderizarLayout(null as any, 'grid-2x2')).toBe(false);
    });
  });

  describe('obterLinhas', () => {
    it('deve organizar campos em linhas corretamente', () => {
      const campos: CampoAcordion[] = [
        { id: '1', rotulo: 'R1', valor: 'V1' },
        { id: '2', rotulo: 'R2', valor: 'V2' },
        { id: '3', rotulo: 'R3', valor: 'V3' }
      ];
      const result = component.obterLinhas(campos, 2);
      expect(result.length).toBe(2);
      expect(result[0].length).toBe(2);
      expect(result[1].length).toBe(1);
    });
  });

  describe('Rastreamento', () => {
    it('rastrearPorSecao deve retornar o id ou index', () => {
      const secao = { id: 's1' } as SecaoAcordion;
      expect(component.rastrearPorSecao(0, secao)).toBe('s1');
      expect(component.rastrearPorSecao(5, { id: '' } as any)).toBe('5');
    });

    it('rastrearPorCampo deve retornar o id ou index', () => {
      const campo = { id: 'c1' } as CampoAcordion;
      expect(component.rastrearPorCampo(0, campo)).toBe('c1');
      expect(component.rastrearPorCampo(3, { id: '' } as any)).toBe('3');
    });
  });

  describe('Scroll Lock', () => {
    afterEach(() => {
      component.desbloquearScrollCorpo();
    });

    it('bloquearScrollCorpo deve alterar o estilo do body', () => {
      component.bloquearScrollCorpo();
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.position).toBe('fixed');
    });

    it('desbloquearScrollCorpo deve limpar o estilo do body', () => {
      component.bloquearScrollCorpo();
      component.desbloquearScrollCorpo();
      expect(document.body.style.overflow).toBe('');
      expect(document.body.style.position).toBe('');
    });
  });
});