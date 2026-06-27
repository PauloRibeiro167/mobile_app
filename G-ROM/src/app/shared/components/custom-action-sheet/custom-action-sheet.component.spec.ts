import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonButton } from '@ionic/angular/standalone';

import { CustomActionSheetComponent, ActionSheetButton } from './custom-action-sheet.component';

describe('CustomActionSheetComponent', () => {
  let component: CustomActionSheetComponent;
  let fixture: ComponentFixture<CustomActionSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomActionSheetComponent, IonButton]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomActionSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should have default values', () => {
      expect(component.isOpen).toBe(false);
      expect(component.header).toBe('');
      expect(component.buttons).toEqual([]);
    });

    it('should accept input values', () => {
      const testButtons: ActionSheetButton[] = [
        { text: 'Option 1' },
        { text: 'Option 2', selected: true }
      ];

      component.isOpen = true;
      component.header = 'Test Header';
      component.buttons = testButtons;

      expect(component.isOpen).toBe(true);
      expect(component.header).toBe('Test Header');
      expect(component.buttons).toEqual(testButtons);
    });
  });

  describe('safeButtons', () => {
    it('should return buttons array when defined', () => {
      const testButtons: ActionSheetButton[] = [{ text: 'Test' }];
      component.buttons = testButtons;
      expect(component.safeButtons).toEqual(testButtons);
    });

    it('should return empty array when buttons is undefined', () => {
      component.buttons = undefined as any;
      expect(component.safeButtons).toEqual([]);
    });
  });

  describe('getButtonClasses', () => {
    it('should return cancel button classes', () => {
      const button: ActionSheetButton = { text: 'Cancel', role: 'cancel' };
      const classes = component.getButtonClasses(button);
      expect(classes).toContain('action-sheet-button--cancel');
      expect(classes).toContain('text-fixed-white');
    });

    it('should return selected button classes', () => {
      const button: ActionSheetButton = { text: 'Selected', selected: true };
      const classes = component.getButtonClasses(button);
      expect(classes).toContain('action-sheet-button--selected');
      expect(classes).toContain('w-80');
    });

    it('should return default button classes', () => {
      const button: ActionSheetButton = { text: 'Default' };
      const classes = component.getButtonClasses(button);
      expect(classes).toContain('w-80');
      expect(classes).not.toContain('action-sheet-button--selected');
      expect(classes).not.toContain('action-sheet-button--cancel');
    });
  });

  describe('handleButtonClick', () => {
    it('should emit buttonClick event', () => {
      spyOn(component.buttonClick, 'emit');
      const button: ActionSheetButton = { text: 'Test' };

      component.handleButtonClick(button);

      expect(component.buttonClick.emit).toHaveBeenCalledWith(button);
    });

    it('should call button handler if provided', () => {
      const handlerSpy = jasmine.createSpy('handler');
      const button: ActionSheetButton = { text: 'Test', handler: handlerSpy };

      component.handleButtonClick(button);

      expect(handlerSpy).toHaveBeenCalled();
    });

    it('should dismiss modal for non keep-open roles', () => {
      spyOn(component.didDismiss, 'emit');
      const button: ActionSheetButton = { text: 'Test', role: 'destructive' };

      component.handleButtonClick(button);

      expect(component.didDismiss.emit).toHaveBeenCalledWith({ role: 'destructive' });
      expect(component.isOpen).toBe(false);
    });

    it('should not dismiss modal for keep-open role', () => {
      spyOn(component.didDismiss, 'emit');
      component.isOpen = true;
      const button: ActionSheetButton = { text: 'Test', role: 'keep-open' };

      component.handleButtonClick(button);

      expect(component.didDismiss.emit).not.toHaveBeenCalled();
      expect(component.isOpen).toBe(true);
    });
  });

  describe('onModalDismiss', () => {
    it('should close modal and emit didDismiss event', () => {
      spyOn(component.didDismiss, 'emit');
      component.isOpen = true;
      const event = { role: 'backdrop' };

      component.onModalDismiss(event);

      expect(component.isOpen).toBe(false);
      expect(component.didDismiss.emit).toHaveBeenCalledWith(event);
    });
  });

  describe('dismissFromBackdrop', () => {
    it('should dismiss using backdrop role', () => {
      spyOn(component.didDismiss, 'emit');
      component.isOpen = true;

      component.dismissFromBackdrop();

      expect(component.isOpen).toBe(false);
      expect(component.didDismiss.emit).toHaveBeenCalledWith({ role: 'backdrop' });
    });
  });
});
