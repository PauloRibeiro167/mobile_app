import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';

import { AuthService } from '@services';
import { PdvAccessService } from '@services/api';
import { BottomTabBarComponent } from './bottom-tab-bar.component';

describe('BottomTabBarComponent', () => {
  let component: BottomTabBarComponent;
  let fixture: ComponentFixture<BottomTabBarComponent>;
  let pdvAccessServiceSpy: jasmine.SpyObj<PdvAccessService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    pdvAccessServiceSpy = jasmine.createSpyObj('PdvAccessService', [
      'requestPdvAccess',
      'confirmOpening',
      'getOpeningDraft',
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getUsuarioLogado',
    ]);
    pdvAccessServiceSpy.requestPdvAccess.and.resolveTo({
      status: 'granted',
      session: {} as any,
    });
    pdvAccessServiceSpy.getOpeningDraft.and.returnValue({
      origem: 'bottom-tab-bar',
      fundoTrocoSugerido: 50,
      observacoesPadrao: 'Mock',
      titulo: 'Mock',
      descricao: 'Mock',
    });
    authServiceSpy.getUsuarioLogado.and.returnValue({
      nome: 'Usuário Teste',
      email: 'teste@teste.com',
    });

    await TestBed.configureTestingModule({
      imports: [BottomTabBarComponent, IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: PdvAccessService, useValue: pdvAccessServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomTabBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });
});
