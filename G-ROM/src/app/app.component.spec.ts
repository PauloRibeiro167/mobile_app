import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { ThemeService, NavigationService, AuthService, AppInitializationService } from '@services';

// Jasmine type declarations
declare const expect: any;

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    const themeSpy = jasmine.createSpyObj('ThemeService', ['updateThemeClass', 'applyTheme']);
    themeSpy.updateThemeClass.and.returnValue('');
    themeSpy.applyTheme.and.resolveTo();
    const navigationSpy = jasmine.createSpyObj('NavigationService', [], {
      currentPage$: of({ title: 'Início', icon: 'bi-house-fill' })
    });
    const authSpy = jasmine.createSpyObj('AuthService', ['initialize', 'isAuthenticated'], {
      usuarioLogado$: of(null)
    });
    authSpy.initialize.and.resolveTo();
    authSpy.isAuthenticated.and.returnValue(false);
    const appInitializationSpy = jasmine.createSpyObj('AppInitializationService', ['initializeApp']);
    appInitializationSpy.initializeApp.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [
        provideNoopAnimations(),
        { provide: ThemeService, useValue: themeSpy },
        { provide: NavigationService, useValue: navigationSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: AppInitializationService, useValue: appInitializationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    await fixture.detectChanges();
  });

  it('deve criar o app', () => {
    expect(component).toBeTruthy();
  });

  it('deve esconder o chrome autenticado na rota de login com query string', () => {
    component.isAuthenticated = true;
    (component as any).currentUrl = '/login?next=%2Fhome';

    expect(component.showAuthenticatedChrome).toBeFalse();
  });
});
