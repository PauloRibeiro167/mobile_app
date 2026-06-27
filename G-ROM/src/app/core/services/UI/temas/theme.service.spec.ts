import { TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { ThemeService } from './theme.service';
import { PreferencesService } from '../../infraestrutura/preferences.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let platformSpy: jasmine.SpyObj<Platform>;
  let preferencesServiceSpy: jasmine.SpyObj<PreferencesService>;

  beforeEach(() => {
    const platformSpyObj = jasmine.createSpyObj('Platform', ['is']);
    preferencesServiceSpy = jasmine.createSpyObj('PreferencesService', ['getJson', 'setJson']);
    preferencesServiceSpy.getJson.and.resolveTo({});
    preferencesServiceSpy.setJson.and.resolveTo();
    spyOn<any>(ThemeService.prototype, 'initializeTheme').and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: Platform, useValue: platformSpyObj },
        { provide: PreferencesService, useValue: preferencesServiceSpy }
      ]
    });

    service = TestBed.inject(ThemeService);
    platformSpy = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;

    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
    });

    document.body.classList.remove('dark');
  });

  afterEach(() => {
    document.body.classList.remove('dark');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('applyTheme', () => {
    it('should apply saved theme', async () => {
      preferencesServiceSpy.getJson.and.resolveTo({ theme: 'dark' });

      await service.applyTheme();

      expect(document.body.classList.contains('dark')).toBe(true);
    });

    it('should apply device theme if no saved theme', async () => {
      preferencesServiceSpy.getJson.and.resolveTo({});
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jasmine.createSpy().and.returnValue({ matches: true })
      });

      await service.applyTheme();

      expect(document.body.classList.contains('dark')).toBe(true);
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark and persist', async () => {
      document.body.classList.remove('dark');
      platformSpy.is.and.returnValue(false);
      spyOn<any>(service, 'isRunningInEmulator').and.returnValue(false);
      spyOn<any>(service, 'isRunningInWebView').and.returnValue(false);
      preferencesServiceSpy.getJson.and.resolveTo({});

      service.toggleTheme();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(document.body.classList.contains('dark')).toBe(true);
      expect(preferencesServiceSpy.setJson).toHaveBeenCalledWith('appData', { theme: 'dark' });
    });
  });

  describe('reloadTheme', () => {
    it('should remove saved theme and apply device theme', async () => {
      preferencesServiceSpy.getJson.and.resolveTo({ theme: 'dark' });
      platformSpy.is.and.returnValue(false);
      spyOn<any>(service, 'isRunningInEmulator').and.returnValue(false);
      spyOn<any>(service, 'isRunningInWebView').and.returnValue(false);
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jasmine.createSpy().and.returnValue({ matches: false })
      });

      await service.reloadTheme();

      expect(document.body.classList.contains('dark')).toBe(false);
      expect(preferencesServiceSpy.setJson).toHaveBeenCalledWith('appData', {});
    });
  });

  describe('sync helpers', () => {
    it('should return true when dark class is present', () => {
      document.body.classList.add('dark');
      expect(service.isDarkMode()).toBe(true);
    });

    it('should return the CSS class for dark mode', () => {
      document.body.classList.add('dark');
      expect(service.updateThemeClass()).toBe('dark');
    });

    it('should return the current theme', () => {
      document.body.classList.remove('dark');
      expect(service.getCurrentTheme()).toBe('light');
    });
  });
});
