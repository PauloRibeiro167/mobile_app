/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { SafeAreaService } from './safe-area.service';
import { SafeArea } from 'capacitor-plugin-safe-area';

describe('SafeAreaService', () => {
  let service: SafeAreaService;

  beforeEach(() => {
    // Spy on SafeArea.getSafeAreaInsets
    spyOn(SafeArea, 'getSafeAreaInsets').and.returnValue(Promise.resolve({ insets: { top: 0, bottom: 0, left: 0, right: 0 } }));

    TestBed.configureTestingModule({
      providers: [SafeAreaService]
    });

    service = TestBed.inject(SafeAreaService);
  });

  it('should be created', () => {
    (expect(service) as any).toBeTruthy();
  });

  describe('updateSafeArea', () => {
    it('should exist as a method', () => {
      (expect(typeof service.updateSafeArea) as any).toBe('function');
    });
  });

  describe('getCurrentSafeArea', () => {
    it('should return current safe area value', () => {
      const currentValue = service.getCurrentSafeArea();
      (expect(currentValue) as any).toEqual({ top: 0, bottom: 0 }); // Initial value
    });
  });
});
