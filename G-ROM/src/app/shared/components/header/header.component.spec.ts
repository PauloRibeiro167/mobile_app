import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default title', () => {
    expect(component.title).toBe('Mercadinho');
  });

  it('should display custom title when provided', () => {
    component.title = 'Custom Title';
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('ion-title');
    expect(titleElement.textContent).toContain('Custom Title');
  });

  it('should show menu button by default', () => {
    expect(component.showMenuButton).toBeTruthy();
  });

  it('should hide menu button when showMenuButton is false', () => {
    component.showMenuButton = false;
    fixture.detectChanges();

    const menuButton = fixture.debugElement.query(By.css('ion-menu-button'));
    expect(menuButton).toBe(null as any);
  });

  it('should show back button when showBackButton is true', () => {
    component.showBackButton = true;
    fixture.detectChanges();

    const backButton = fixture.debugElement.query(By.css('ion-button'));
    expect(backButton).toBeTruthy();
  });

  it('should emit closeMenu event when back button is clicked', () => {
    spyOn(component.closeMenu, 'emit');

    component.showBackButton = true;
    fixture.detectChanges();

    const backButton = fixture.debugElement.query(By.css('ion-button'));
    backButton.nativeElement.click();

    expect(component.closeMenu.emit).toHaveBeenCalled();
  });

  it('should call onCloseMenu when back button is clicked', () => {
    spyOn(component, 'onCloseMenu');

    component.showBackButton = true;
    fixture.detectChanges();

    const backButton = fixture.nativeElement.querySelector('ion-button');
    const event = new Event('click');

    component.onCloseMenu(event);

    expect(component.onCloseMenu).toHaveBeenCalledWith(event);
  });
});
