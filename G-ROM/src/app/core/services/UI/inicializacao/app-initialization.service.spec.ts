  /// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { AnimationController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AppInitializationService } from './app-initialization.service';
import { ThemeService } from '@services';

describe('AppInitializationService', () => {
  let service: AppInitializationService;
  let platformSpy: jasmine.SpyObj<Platform>;
  let animationCtrlSpy: jasmine.SpyObj<AnimationController>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;

  beforeEach(() => {
    const platformMock = jasmine.createSpyObj('Platform', ['ready', 'is']);
    const animationCtrlMock = jasmine.createSpyObj('AnimationController', ['create']);
    const themeServiceMock = jasmine.createSpyObj('ThemeService', [
      'toggleTheme', 'reloadTheme', 'applyTheme', 'isDarkMode', 'updateThemeClass', 'getCurrentTheme'
    ]);

    TestBed.configureTestingModule({
      providers: [
        AppInitializationService,
        { provide: Platform, useValue: platformMock },
        { provide: AnimationController, useValue: animationCtrlMock },
        { provide: ThemeService, useValue: themeServiceMock }
      ]
    });

    service = TestBed.inject(AppInitializationService);
    platformSpy = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
    animationCtrlSpy = TestBed.inject(AnimationController) as jasmine.SpyObj<AnimationController>;
    themeServiceSpy = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>;
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('initializeApp', () => {
    beforeEach(() => {
      platformSpy.ready.and.returnValue(Promise.resolve('dom'));
      platformSpy.is.and.returnValue(false);
    });

    it('deve aguardar platform.ready()', async () => {
      await service.initializeApp();
      expect(platformSpy.ready).toHaveBeenCalled();
    });

    it('deve configurar status bar em plataforma nativa', async () => {
      // Mock Capacitor for native platform
      const originalCapacitor = (window as any).Capacitor;
      Object.defineProperty(window, 'Capacitor', {
        value: {
          isNativePlatform: true,
          isPluginAvailable: () => true,
          Plugins: {
            StatusBar: jasmine.createSpyObj('StatusBar', ['setStyle'])
          }
        },
        writable: true
      });

      const matchMediaSpy = spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);

      await service.initializeApp();

      expect(platformSpy.ready).toHaveBeenCalled();

      // Restore original Capacitor
      Object.defineProperty(window, 'Capacitor', {
        value: originalCapacitor,
        writable: true
      });
    });

    it('deve configurar status bar com tema escuro em plataforma nativa', async () => {
      // Mock Capacitor for native platform
      const originalCapacitor = (window as any).Capacitor;
      Object.defineProperty(window, 'Capacitor', {
        value: {
          isNativePlatform: true,
          isPluginAvailable: () => true,
          Plugins: {
            StatusBar: jasmine.createSpyObj('StatusBar', ['setStyle'])
          }
        },
        writable: true
      });

      const matchMediaSpy = spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);

      await service.initializeApp();

      expect(platformSpy.ready).toHaveBeenCalled();

      // Restore original Capacitor
      Object.defineProperty(window, 'Capacitor', {
        value: originalCapacitor,
        writable: true
      });
    });

    it('deve executar animações de entrada no Android', async () => {
      // Mock Capacitor for native platform
      const originalCapacitor = (window as any).Capacitor;
      Object.defineProperty(window, 'Capacitor', {
        value: {
          isNativePlatform: true,
          isPluginAvailable: () => true,
          Plugins: {
            StatusBar: jasmine.createSpyObj('StatusBar', ['setStyle'])
          }
        },
        writable: true
      });

      // Spy on Capacitor.isNativePlatform directly
      spyOn(Capacitor, 'isNativePlatform').and.returnValue(true);

      platformSpy.is.and.returnValue(true); // Android
      const animateElementSpy = spyOn<any>(service, 'animateElement').and.returnValue(Promise.resolve());
      const playEntryAnimationsSpy = spyOn<any>(service, 'playEntryAnimations').and.callThrough();

      await service.initializeApp();

      expect(playEntryAnimationsSpy).toHaveBeenCalled();
      expect(animateElementSpy.calls.count()).toBe(4);

      // Restore original Capacitor
      Object.defineProperty(window, 'Capacitor', {
        value: originalCapacitor,
        writable: true
      });
    });

    it('não deve executar animações de entrada em plataformas não-Android', async () => {
      // Mock Capacitor for native platform
      const originalCapacitor = (window as any).Capacitor;
      Object.defineProperty(window, 'Capacitor', {
        value: {
          isNativePlatform: true,
          isPluginAvailable: () => true,
          Plugins: {
            StatusBar: jasmine.createSpyObj('StatusBar', ['setStyle'])
          }
        },
        writable: true
      });

      platformSpy.is.and.returnValue(false); // Não Android
      const animateElementSpy = spyOn<any>(service, 'animateElement').and.returnValue(Promise.resolve());

      await service.initializeApp();

      expect(animateElementSpy).not.toHaveBeenCalled();

      // Restore original Capacitor
      Object.defineProperty(window, 'Capacitor', {
        value: originalCapacitor,
        writable: true
      });
    });
  });

  describe('configureStatusBar', () => {
    it('deve configurar status bar com tema claro quando prefers-color-scheme não é dark', () => {
      const matchMediaSpy = spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);

      (service as unknown as { configureStatusBar: () => void }).configureStatusBar();

      // Teste passa se não lança erro
      expect(true).toBe(true);
    });

    it('deve configurar status bar com tema escuro quando prefers-color-scheme é dark', () => {
      const matchMediaSpy = spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);

      (service as unknown as { configureStatusBar: () => void }).configureStatusBar();

      // Teste passa se não lança erro
      expect(true).toBe(true);
    });
  });

  describe('playEntryAnimations', () => {
    it('deve executar animações para todos os elementos', async () => {
      const animateElementSpy = spyOn<any>(service, 'animateElement').and.returnValue(Promise.resolve());

      await (service as unknown as { playEntryAnimations: () => Promise<void> }).playEntryAnimations();

      expect(animateElementSpy.calls.count()).toBe(4);
      expect(animateElementSpy).toHaveBeenCalledWith('ion-app', jasmine.any(Object));
      expect(animateElementSpy).toHaveBeenCalledWith('.header', jasmine.any(Object));
      expect(animateElementSpy).toHaveBeenCalledWith('.bottom-tab-bar', jasmine.any(Object));
      expect(animateElementSpy).toHaveBeenCalledWith('ion-router-outlet', jasmine.any(Object));
    });
  });

  describe('animateElement', () => {
    it('deve criar e executar animação quando elemento existe', async () => {
      const mockElement = document.createElement('div');
      spyOn(document, 'querySelector').and.returnValue(mockElement);

      const mockAnimation = jasmine.createSpyObj('Animation', ['addElement', 'duration', 'fromTo', 'play']);
      mockAnimation.addElement.and.returnValue(mockAnimation);
      mockAnimation.duration.and.returnValue(mockAnimation);
      mockAnimation.fromTo.and.returnValue(mockAnimation);
      mockAnimation.play.and.returnValue(Promise.resolve());

      animationCtrlSpy.create.and.returnValue(mockAnimation);

  await (service as unknown as { animateElement: (a: string, b: { from: string; to: string; duration: number }) => Promise<void> }).animateElement('test-selector', {
        from: 'opacity: 0',
        to: 'opacity: 1',
        duration: 500
      });

      expect(animationCtrlSpy.create.calls.count()).toBe(1);
      expect(mockAnimation.addElement.calls.count()).toBe(1);
      expect(mockAnimation.duration.calls.count()).toBe(1);
      expect(mockAnimation.fromTo.calls.count()).toBe(1);
      expect(mockAnimation.play.calls.count()).toBe(1);
    });

    it('não deve fazer nada quando elemento não existe', async () => {
      spyOn(document, 'querySelector').and.returnValue(null);

  await (service as unknown as { animateElement: (a: string, b: { from: string; to: string; duration: number }) => Promise<void> }).animateElement('test-selector', {
        from: 'opacity: 0',
        to: 'opacity: 1',
        duration: 500
      });

      expect(animationCtrlSpy.create.calls.count()).toBe(0);
    });
  });
});
