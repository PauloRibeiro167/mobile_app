import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AppComponent } from '../../app/app.component';
import { ThemeService, NavigationService, AuthService, AppInitializationService } from '@services';

// Jasmine type declarations
declare const expect: any;

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    const themeSpy = jasmine.createSpyObj('ThemeService', ['updateThemeClass', 'applyTheme']);
    themeSpy.applyTheme.and.resolveTo();
    const navigationSpy = jasmine.createSpyObj('NavigationService', [], {
      currentPage$: of({ title: 'Página de Teste', icon: 'home' })
    });
    const authSpy = jasmine.createSpyObj('AuthService', ['initialize', 'isAuthenticated'], {
      usuarioLogado$: of(null)
    });
    authSpy.initialize.and.resolveTo();
    authSpy.isAuthenticated.and.returnValue(false);
    const appInitializationSpy = jasmine.createSpyObj('AppInitializationService', ['initializeApp']);
    appInitializationSpy.initializeApp.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule
      ],
      providers: [
        provideNoopAnimations(),
        { provide: ThemeService, useValue: themeSpy },
        { provide: NavigationService, useValue: navigationSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: AppInitializationService, useValue: appInitializationSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    await fixture.detectChanges();
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter observable currentPage$', () => {
    expect(component.currentPage$).toBeDefined();
  });

  it('deve retornar classe do tema', () => {
    const themeServiceSpy = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>;
    themeServiceSpy.updateThemeClass.and.returnValue('tema-escuro');

    const themeClass = component.themeClass;

    expect(themeClass).toBe('tema-escuro');
  });
});
