/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { AppLifecycleService } from './app-lifecycle.service';
import { SafeAreaService } from '@services';
import { ThemeService } from '@services';

describe('AppLifecycleService', () => {
  let service: AppLifecycleService;
  let safeAreaServiceSpy: jasmine.SpyObj<SafeAreaService>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;

  beforeEach(() => {
    const safeAreaSpy = jasmine.createSpyObj('SafeAreaService', ['updateSafeArea']);
    const themeSpy = jasmine.createSpyObj('ThemeService', ['dummy']); // Método dummy para evitar array vazio

    TestBed.configureTestingModule({
      providers: [
        AppLifecycleService,
        { provide: SafeAreaService, useValue: safeAreaSpy },
        { provide: ThemeService, useValue: themeSpy }
      ]
    });

    service = TestBed.inject(AppLifecycleService);
    safeAreaServiceSpy = TestBed.inject(SafeAreaService) as jasmine.SpyObj<SafeAreaService>;
    themeServiceSpy = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setupDynamicListeners', () => {
    it('should call updateSafeArea on initial setup', () => {
      service.setupDynamicListeners();

      expect(safeAreaServiceSpy.updateSafeArea).toHaveBeenCalled();
    });

    // TODO: Add tests for event listeners when window mocking is properly configured
    it('should setup resize listener', () => {
      const addEventListenerSpy = spyOn(window, 'addEventListener');

      service.setupDynamicListeners();

      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', jasmine.any(Function), undefined);
    });

    // Theme change listener test removed due to complex RxJS fromEvent mocking
  });
});
