import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { LoginPage } from './login.page';
import { AuthService, PreferencesService } from '@services';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['initialize', 'isAuthenticated', 'login'], {
      usuarioLogado$: undefined
    });
    authServiceSpy.initialize.and.resolveTo();
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.login.and.resolveTo(true);

    const preferencesServiceSpy = jasmine.createSpyObj('PreferencesService', ['getJson', 'setJson', 'remove']);
    preferencesServiceSpy.getJson.and.resolveTo(null);
    preferencesServiceSpy.setJson.and.resolveTo();
    preferencesServiceSpy.remove.and.resolveTo();

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), LoginPage],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PreferencesService, useValue: preferencesServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    await fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
