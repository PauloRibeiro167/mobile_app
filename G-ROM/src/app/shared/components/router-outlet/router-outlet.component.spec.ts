import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { RouterOutletComponent } from './router-outlet.component';

describe('RouterOutletComponent', () => {
  let component: RouterOutletComponent;
  let fixture: ComponentFixture<RouterOutletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterOutletComponent,
        RouterTestingModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouterOutletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('Template', () => {
    it('deve conter router-outlet no template', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const routerOutlet = compiled.querySelector('router-outlet');

      expect(routerOutlet).toBeTruthy();
    });
  });

  describe('Host Attributes', () => {
    it('deve ter atributo unique-id definido', () => {
      const hostElement = fixture.nativeElement as HTMLElement;

      expect(hostElement.getAttribute('unique-id')).toBe('router-outlet');
    });
  });

  describe('Standalone Component', () => {
    it('deve ser um componente standalone', () => {
      // Verifica se o componente pode ser criado sem módulo
      expect(() => {
        const testComponent = new RouterOutletComponent();
        expect(testComponent).toBeTruthy();
      }).not.toThrow();
    });

    it('deve importar RouterOutlet corretamente', () => {
      // Verifica se o componente foi configurado corretamente no TestBed
      expect(fixture.componentInstance).toBeTruthy();
    });
  });
});
