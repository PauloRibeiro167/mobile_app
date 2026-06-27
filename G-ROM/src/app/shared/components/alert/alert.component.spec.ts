import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertComponent, AlertType } from './alert.component';
import { DomSanitizer } from '@angular/platform-browser';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;
  let sanitizerSpy: jasmine.SpyObj<DomSanitizer>;

  beforeEach(async () => {
    const sanitizerMock = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustHtml']);

    await TestBed.configureTestingModule({
      imports: [AlertComponent],
      providers: [
        { provide: DomSanitizer, useValue: sanitizerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    sanitizerSpy = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
    sanitizerSpy.bypassSecurityTrustHtml.and.returnValue('safe html');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should configure alert for cpf type', () => {
      component.type = 'cpf';
      component.ngOnChanges();

      expect(component.header).toBe('CPF/CNPJ do Proprietário');
      expect(component.icon).toBe('person-circle-outline');
      expect(component.headerColor).toBe('#0097a7');
      expect(sanitizerSpy.bypassSecurityTrustHtml).toHaveBeenCalled();
    });

    it('should configure alert for error type with custom errors', () => {
      component.type = 'error';
      component.data = { errors: ['Erro 1', 'Erro 2'] };
      component.ngOnChanges();

      expect(component.header).toBe('Dados Inválidos');
      expect(component.icon).toBe('alert-circle-outline');
      expect(component.message).toContain('Erro 1');
      expect(component.message).toContain('Erro 2');
    });

    it('should configure alert for success type with custom message', () => {
      component.type = 'success';
      component.data = { message: 'Teste sucesso' };
      component.ngOnChanges();

      expect(component.header).toBe('Sucesso!');
      expect(component.icon).toBe('checkmark-circle-outline');
      expect(component.message).toContain('Teste sucesso');
    });

    it('should handle custom data overrides', () => {
      component.type = 'custom';
      component.data = {
        header: 'Custom Header',
        subHeader: 'Custom SubHeader',
        icon: 'custom-icon',
        headerColor: '#123456',
        buttons: [{ text: 'Custom Button' }]
      };
      component.ngOnChanges();

      expect(component.header).toBe('Custom Header');
      expect(component.subHeader).toBe('Custom SubHeader');
      expect(component.icon).toBe('custom-icon');
      expect(component.headerColor).toBe('#123456');
      expect(component.buttons).toEqual([{ text: 'Custom Button' }]);
    });
  });

  describe('onButtonClick', () => {
    it('should emit buttonClick event', () => {
      spyOn(component.buttonClick, 'emit');
      const event = { detail: { role: 'confirm' }, type: 'buttonClick' };

      component.onButtonClick(event);

      expect(component.buttonClick.emit).toHaveBeenCalledWith({ role: 'confirm' });
    });

    it('should emit alertClosed on didDismiss', () => {
      spyOn(component.alertClosed, 'emit');
      const event = { detail: { role: 'cancel' }, type: 'didDismiss' };

      component.onButtonClick(event);

      expect(component.alertClosed.emit).toHaveBeenCalled();
    });
  });

  describe('abrirAlerta', () => {
    it('should set type, data and open alert', (done) => {
      component.abrirAlerta('info', { test: 'data' });

      expect(component.type).toBe('info');
      expect(component.data).toEqual({ test: 'data' });
      expect(component.isOpen).toBe(false);

      setTimeout(() => {
        expect(component.isOpen).toBe(true);
        done();
      }, 15);
    });
  });

  describe('PRESETS', () => {
    it('should have all required preset types', () => {
      const presets = AlertComponent.PRESETS;
      const expectedTypes: AlertType[] = ['cpf', 'inscricao', 'dica', 'info', 'example', 'error', 'success', 'warning', 'custom'];

      expectedTypes.forEach(type => {
        expect(presets[type]).toBeTruthy();
      });
    });
  });
});