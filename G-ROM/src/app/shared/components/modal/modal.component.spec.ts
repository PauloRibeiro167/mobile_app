import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ModalComponent, ModalConfig } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('Propriedades padrão', () => {
    it('deve ter valores padrão corretos', () => {
      expect(component.title).toBe('Confirmação');
      expect(component.message).toBe('Você tem certeza?');
      expect(component.confirmText).toBe('Confirmar');
      expect(component.cancelText).toBe('Cancelar');
      expect(component.icon).toBe('help-circle-outline');
      expect(component.confirmRoute).toBe(null);
      expect(component.cancelRoute).toBe(null);
      expect(component.isAlert).toBe(false);
      expect(component.isInline).toBe(false);
      expect(component.show).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('deve configurar texto para alert', () => {
      component.isAlert = true;
      component.confirmText = undefined as any;
      component.cancelText = undefined as any;

      component.ngOnInit();

      expect(component.confirmText).toBe(null);
      expect(component.cancelText).toBe('Fechar');
    });

    it('não deve alterar textos se não for alert', () => {
      component.isAlert = false;
      component.confirmText = 'Sim';
      component.cancelText = 'Não';

      component.ngOnInit();

      expect(component.confirmText).toBe('Sim');
      expect(component.cancelText).toBe('Não');
    });
  });

  describe('showModal', () => {
    it('deve configurar modal com config básica', () => {
      const config: ModalConfig = {
        title: 'Teste',
        message: 'Mensagem de teste'
      };

      component.showModal(config);

      expect(component.title).toBe('Teste');
      expect(component.message).toBe('Mensagem de teste');
      expect(component.icon).toBe('help-circle-outline');
      expect(component.confirmText).toBe('Confirmar');
      expect(component.cancelText).toBe('Cancelar');
      expect(component.show).toBe(true);
    });

    it('deve configurar modal com config completa', () => {
      const config: ModalConfig = {
        title: 'Teste Completo',
        message: 'Mensagem completa',
        icon: 'warning-outline',
        confirmText: 'OK',
        cancelText: 'Cancelar',
        isAlert: true,
        confirmRoute: '/confirm',
        cancelRoute: '/cancel'
      };
      const onConfirmSpy = jasmine.createSpy('onConfirm');
      const onCancelSpy = jasmine.createSpy('onCancel');

      component.showModal(config, onConfirmSpy, onCancelSpy);

      expect(component.title).toBe('Teste Completo');
      expect(component.message).toBe('Mensagem completa');
      expect(component.icon).toBe('warning-outline');
      expect(component.confirmText).toBe('OK');
      expect(component.cancelText).toBe('Cancelar');
      expect(component.isAlert).toBe(true);
      expect(component.confirmRoute).toBe('/confirm');
      expect(component.cancelRoute).toBe('/cancel');
      expect(component.show).toBe(true);
      expect(component['onConfirmCallback']).toBe(onConfirmSpy);
      expect(component['onCancelCallback']).toBe(onCancelSpy);
    });
  });

  describe('hideModal', () => {
    it('deve esconder modal', () => {
      component.show = true;

      component.hideModal();

      expect(component.show).toBe(false);
    });
  });

  describe('showAlert', () => {
    it('deve mostrar alert com configuração padrão', () => {
      spyOn(component, 'showModal');
      const onCloseSpy = jasmine.createSpy('onClose');

      component.showAlert('Título', 'Mensagem', 'info', onCloseSpy);

      expect(component.showModal).toHaveBeenCalledWith({
        title: 'Título',
        message: 'Mensagem',
        icon: 'info',
        confirmText: null,
        cancelText: 'Fechar',
        isAlert: true
      }, onCloseSpy, onCloseSpy);
    });
  });

  describe('showConfirm', () => {
    it('deve mostrar confirmação com configuração padrão', () => {
      spyOn(component, 'showModal');
      const onConfirmSpy = jasmine.createSpy('onConfirm');
      const onCancelSpy = jasmine.createSpy('onCancel');

      component.showConfirm('Título', 'Mensagem', 'question', onConfirmSpy, onCancelSpy);

      expect(component.showModal).toHaveBeenCalledWith({
        title: 'Título',
        message: 'Mensagem',
        icon: 'question',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        isAlert: false
      }, onConfirmSpy, onCancelSpy);
    });
  });

  describe('onConfirm', () => {
    it('deve emitir evento e navegar se houver rota', () => {
      spyOn(component.confirmed, 'emit');
      component.confirmRoute = '/success';

      component.onConfirm();

      expect(component.confirmed.emit).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/success']);
      expect(component.show).toBe(false);
    });

    it('não deve navegar se não houver rota', () => {
      component.confirmRoute = null;
      component.onConfirm();

      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('deve emitir evento e navegar quando cancelText existe', () => {
      spyOn(component.canceled, 'emit');
      component.cancelRoute = '/cancel';
      component.cancelText = 'Cancelar';

      component.onCancel();

      expect(component.canceled.emit).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/cancel']);
      expect(component.show).toBe(false);
    });

    it('não deve emitir canceled se cancelText for null', () => {
      spyOn(component.canceled, 'emit');
      component.cancelText = null;

      component.onCancel();

      expect(component.canceled.emit).not.toHaveBeenCalled();
    });

    it('não deve navegar se não houver rota', () => {
      component.cancelRoute = null;
      component.onCancel();

      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('getBootstrapIconClass', () => {
    it('deve retornar classe correta para ícones conhecidos', () => {
      const testCases = [
        { icon: 'help-circle-outline', expected: 'bi bi-question-circle' },
        { icon: 'warning-outline', expected: 'bi bi-exclamation-triangle' },
        { icon: 'checkmark-circle-outline', expected: 'bi bi-check-circle' },
        { icon: 'information-circle-outline', expected: 'bi bi-info-circle' },
        { icon: 'unknown-icon', expected: 'bi bi-question-circle' }
      ];

      testCases.forEach(({ icon, expected }) => {
        component.icon = icon;
        expect(component.getBootstrapIconClass()).toBe(expected);
      });
    });
  });

  describe('Event Emitters', () => {
    it('deve ter confirmed como EventEmitter', () => {
      expect(component.confirmed).toBeTruthy();
    });

    it('deve ter canceled como EventEmitter', () => {
      expect(component.canceled).toBeTruthy();
    });
  });
});
