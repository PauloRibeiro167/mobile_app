import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HomePage } from './dashboard.page';
import { DashboardData, DashboardService } from '../../core/services/api/dashboard/dashboard.service';
import { UserService } from '../../core/services/api/user/user.service';
import { of } from 'rxjs';

function createDashboardData(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    caixaStatus: 'CAIXA ABERTO',
    caixaTurno: 'TURNO MANHA',
    vendasTurno: '150,00',
    carrinhoItens: 12,
    metaDiaria: '500,00',
    metaDiariaProgresso: 30,
    estoqueBaixo: 5,
    ticketMedio: '12,50',
    tendenciaVendas: '+8.5% desde ontem',
    ultimasVendas: [],
    appVersao: '1.2.5-stable',
    appUpdateUrl: 'https://mercadinho-app.com/download',
    ...overrides,
  };
}

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(waitForAsync(() => {
    const dashboardSpy = jasmine.createSpyObj('DashboardService', ['getDashboardData']);
    const userSpy = jasmine.createSpyObj('UserService', ['getUserProfile']);

    dashboardSpy.getDashboardData.and.returnValue(
      of(createDashboardData())
    );
    userSpy.getUserProfile.and.returnValue(of({ nome: 'Paulo' } as any));

    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        { provide: DashboardService, useValue: dashboardSpy },
        { provide: UserService, useValue: userSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    dashboardServiceSpy = TestBed.inject(
      DashboardService
    ) as jasmine.SpyObj<DashboardService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    fixture.detectChanges();
  }));

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicializacao', () => {
    it('deve carregar dashboard e perfil do usuario no init', () => {
      expect(dashboardServiceSpy.getDashboardData).toHaveBeenCalled();
      expect(userServiceSpy.getUserProfile).toHaveBeenCalled();
      expect(component.dashboardData?.carrinhoItens).toBe(12);
    });

    it('deve esconder os cards introdutorios na sessao atual', () => {
      spyOn(sessionStorage, 'setItem');

      component.hideIntroCardsForSession();

      expect(component.showIntroCards).toBe(false);
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'dashboard:intro-cards-visible',
        'false'
      );
    });
  });

  describe('Estado da sessao', () => {
    it('deve mostrar os cards introdutorios por padrao quando a sessao nao os ocultou', () => {
      sessionStorage.removeItem('dashboard:intro-cards-visible');

      component.ngOnInit();

      expect(component.showIntroCards).toBe(true);
    });
  });
});
