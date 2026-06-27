import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ElementRef, EventEmitter } from '@angular/core';
import { MapComponent } from './map.component';

// Mock simples do Leaflet
const mockMap = {
  remove: jasmine.createSpy('remove'),
  setView: jasmine.createSpy('setView'),
  invalidateSize: jasmine.createSpy('invalidateSize'),
  panTo: jasmine.createSpy('panTo'),
  setZoom: jasmine.createSpy('setZoom'),
  removeLayer: jasmine.createSpy('removeLayer'),
  addLayer: jasmine.createSpy('addLayer')
};

const mockMarker = {
  setLatLng: jasmine.createSpy('setLatLng'),
  addTo: jasmine.createSpy('addTo')
};

const mockTileLayer = {
  addTo: jasmine.createSpy('addTo')
};

// Mock global simplificado
Object.defineProperty(window, 'L', {
  value: {
    map: jasmine.createSpy('map').and.returnValue(mockMap),
    tileLayer: jasmine.createSpy('tileLayer').and.returnValue(mockTileLayer),
    marker: jasmine.createSpy('marker').and.returnValue(mockMarker),
    icon: jasmine.createSpy('icon').and.returnValue({}),
    latLng: jasmine.createSpy('latLng').and.returnValue({ lat: 0, lng: 0 }),
    Marker: { prototype: { options: { icon: {} } } }
  },
  writable: true
});

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;

    // Mock do ViewChild
    Object.defineProperty(component, 'mapElement', {
      value: { nativeElement: document.createElement('div') },
      writable: true
    });

    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('Propriedades padrão', () => {
    it('deve ter zoom padrão como 20', () => {
      expect(component.zoom).toBe(20);
    });

    it('deve ter showControls como false por padrão', () => {
      expect(component.showControls).toBe(false);
    });

    it('deve ter height como "300px" por padrão', () => {
      expect(component.height).toBe('300px');
    });
  });

  describe('ngOnInit', () => {
    it('deve gerar mapElementId se não fornecido', () => {
      component.mapId = undefined;
      component.ngOnInit();
      expect(component.mapElementId.startsWith('map-')).toBe(true);
    });

    it('deve usar mapId fornecido', () => {
      const testId = 'test-map';
      component.mapId = testId;
      component.ngOnInit();
      expect(component.mapElementId).toBe(testId);
    });
  });

  describe('Métodos públicos', () => {
    beforeEach(() => {
      component['map'] = mockMap as any;
    });

    it('addMarker deve funcionar', () => {
      const result = component.addMarker(-3.7, -38.5);
      expect(result).toBeTruthy();
    });

    it('removeMarker deve funcionar', () => {
      const marker = {} as any;
      expect(() => component.removeMarker(marker)).not.toThrow();
    });

    it('setZoom deve funcionar', () => {
      expect(() => component.setZoom(15)).not.toThrow();
    });

    it('setView deve funcionar', () => {
      expect(() => component.setView(-3.7, -38.5)).not.toThrow();
    });

    it('panTo deve funcionar', () => {
      expect(() => component.panTo(-3.7, -38.5)).not.toThrow();
    });

    it('centerOnMarker deve funcionar', () => {
      component.latitude = -3.7;
      component.longitude = -38.5;
      component['marker'] = mockMarker as any;
      expect(() => component.centerOnMarker()).not.toThrow();
    });

    it('getMap deve retornar algo', () => {
      expect(component.getMap()).toBeTruthy();
    });

    it('invalidateSize deve funcionar', () => {
      expect(() => component.invalidateSize()).not.toThrow();
    });
  });

  describe('Event Emitters', () => {
    it('deve ter mapReady como EventEmitter', () => {
      expect(component.mapReady instanceof EventEmitter).toBe(true);
    });

    it('deve ter markerClick como EventEmitter', () => {
      expect(component.markerClick instanceof EventEmitter).toBe(true);
    });
  });
});
