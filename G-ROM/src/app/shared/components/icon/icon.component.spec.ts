import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';
import { ThemeService } from '@services';

describe('IconComponent', () => {
  let component: IconComponent;
  let fixture: ComponentFixture<IconComponent>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ThemeService', ['isDarkMode']);

    await TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: [
        { provide: ThemeService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
    themeServiceSpy = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set currentColor to whitemode when not dark mode', () => {
    themeServiceSpy.isDarkMode.and.returnValue(false);
    component.whitemode = 'white';
    component.darkmode = 'black';
    component.ngOnInit();
    expect(component.currentColor).toBe('white');
  });

  it('should set currentColor to darkmode when dark mode', () => {
    themeServiceSpy.isDarkMode.and.returnValue(true);
    component.whitemode = 'white';
    component.darkmode = 'black';
    component.ngOnInit();
    expect(component.currentColor).toBe('black');
  });

  it('should have name input', () => {
    component.name = 'home';
    expect(component.name).toBe('home');
  });
});
