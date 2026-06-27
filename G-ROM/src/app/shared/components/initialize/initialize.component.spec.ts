import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { InitializeComponent } from './initialize.component';
import { PreferencesService } from '@services';

describe('InitializeComponent', () => {
  let component: InitializeComponent;
  let fixture: ComponentFixture<InitializeComponent>;
  let preferencesServiceSpy: jasmine.SpyObj<PreferencesService>;

  beforeEach(async () => {
    preferencesServiceSpy = jasmine.createSpyObj('PreferencesService', ['getString', 'setString']);
    preferencesServiceSpy.getString.and.resolveTo(null);
    preferencesServiceSpy.setString.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [InitializeComponent],
      providers: [
        { provide: PreferencesService, useValue: preferencesServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InitializeComponent);
    component = fixture.componentInstance;
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('deve mostrar welcome quando é a primeira vez', async () => {
      preferencesServiceSpy.getString.and.resolveTo(null);
      await component.ngOnInit();

      expect(component.isVisible).toBe(true);
      expect(component.title).toBe('Bem-vindo!');
      expect(component.message).toBe('Esta é a sua primeira vez usando o SITFOR. Explore as funcionalidades de consulta ao cadastro imobiliário.');
      expect(component.buttonText).toBe('Continuar');
    });

    it('deve emitir complete imediatamente quando já viu o welcome', async () => {
      preferencesServiceSpy.getString.and.resolveTo('true');
      spyOn(component.complete, 'emit');

      await component.ngOnInit();

      expect(component.isVisible).toBe(false);
      expect(component.complete.emit).toHaveBeenCalled();
    });
  });

  describe('closeWelcome', () => {
    it('deve esconder o welcome, salvar no Preferences e emitir complete', async () => {
      component.isVisible = true;
      spyOn(component.complete, 'emit');

      await component.closeWelcome();

      expect(component.isVisible).toBe(false);
      expect(preferencesServiceSpy.setString).toHaveBeenCalledWith('hasSeenWelcome', 'true');
      expect(component.complete.emit).toHaveBeenCalled();
    });
  });

  describe('onOverlayClick', () => {
    it('deve fechar welcome quando clicar no overlay', () => {
      component.isVisible = true;
      spyOn(component, 'closeWelcome');

      const mockEvent = {
        target: { classList: { contains: jasmine.createSpy('contains').and.returnValue(true) } }
      } as any;

      component.onOverlayClick(mockEvent);

      expect(component.closeWelcome).toHaveBeenCalled();
    });

    it('não deve fechar welcome quando clicar dentro do card', () => {
      component.isVisible = true;
      spyOn(component, 'closeWelcome');

      const mockEvent = {
        target: { classList: { contains: jasmine.createSpy('contains').and.returnValue(false) } }
      } as any;

      component.onOverlayClick(mockEvent);

      expect(component.closeWelcome).not.toHaveBeenCalled();
    });
  });

  describe('EventEmitter', () => {
    it('deve ter um EventEmitter complete', () => {
      expect(component.complete instanceof EventEmitter).toBe(true);
    });
  });
});
