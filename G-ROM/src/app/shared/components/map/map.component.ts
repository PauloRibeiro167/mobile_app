import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, AfterViewInit, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class MapComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() latitude?: number;
  @Input() longitude?: number;
  @Input() zoom: number = 20;
  @Input() showControls: boolean = false;
  @Input() height: string = '300px';
  @Input() mapId?: string;
  @Input() iconAnchor: [number, number] = [16, 16];
  @Input() iconAnchorY: number = 16;

  mapElementId: string = '';

  @Output() mapReady = new EventEmitter<L.Map>();
  @Output() markerClick = new EventEmitter<L.Marker>();

  @ViewChild('mapContainer', { static: true }) mapElement!: ElementRef;

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private isInitialized = false;
  private getAdjustedCenter(lat: number, lon: number): L.LatLng {
    return L.latLng(lat, lon);
  }

  private invalidateMapSizeDelayed(): void {
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }

  private createOrUpdateMarker(lat: number, lon: number): void {
    if (this.marker) {
      this.marker.setLatLng([lat, lon]);
    } else if (this.map) {
      this.marker = L.marker([lat, lon]).addTo(this.map);
    }
  }

  private configureMapEvents(): void {
    // Override addEventListener to make touchstart and wheel events passive
    const originalAddEventListener = HTMLElement.prototype.addEventListener;
    HTMLElement.prototype.addEventListener = function(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      if (type === 'touchstart' || type === 'wheel') {
        const passiveOptions = typeof options === 'object' ? { ...options, passive: true } : { passive: true };
        return originalAddEventListener.call(this, type, listener, passiveOptions);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  private createMapInstance(): void {
    const mapElement = this.mapElement?.nativeElement;
    if (!mapElement) {
      console.warn('Elemento do mapa não encontrado');
      return;
    }

    // Limpar mapa existente se houver
    if (this.map) {
      this.map.remove();
    }

    const lat = this.latitude || -3.7319;
    const lon = this.longitude || -38.5267;

    this.map = L.map(mapElement, {
      zoomControl: this.showControls,
      attributionControl: this.showControls
    }).setView([lat, lon], this.zoom);
  }

  private addTileLayer(): void {
    if (!this.map) return;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    // Invalidar tamanho imediatamente após setView
    this.map.invalidateSize();
  }

  private setupInitialMarkerAndView(): void {
    if (!this.map || !this.latitude || !this.longitude) return;

    this.createOrUpdateMarker(this.latitude, this.longitude);

    // Aplicar ajuste preciso para centralizar o ícone
    const adjustedLatLng = this.getAdjustedCenter(this.latitude, this.longitude);
    this.map.setView(adjustedLatLng, this.zoom);
  }

  private finalizeInitialization(): void {
    // Invalidar tamanho novamente após adicionar marcador
    this.invalidateMapSizeDelayed();
    setTimeout(() => {
      this.mapReady.emit(this.map);
    }, 200);
  }

  private prepareMapForUpdate(): void {
    if (!this.map) return;
    // Invalidar tamanho primeiro para garantir renderização correta
    this.map.invalidateSize();
  }

  private adjustView(lat: number, lon: number): void {
    if (!this.map) return;

    const adjustedLatLng = this.getAdjustedCenter(lat, lon);
    this.map.setView(adjustedLatLng, this.zoom);
  }

  private finalizeUpdate(): void {
    // Invalidar tamanho após centralização
    this.invalidateMapSizeDelayed();
  }

  private isUpdating = false;

  ngOnInit(): void {
    this.mapElementId = this.mapId || 'map-' + Math.random().toString(36).substr(2, 9);
    this.initializeDefaultIcon();
  }  ngAfterViewInit(): void {
    setTimeout(() => {
      if (!this.isInitialized) {
        this.initMap();
        this.isInitialized = true;
      }
    }, 200);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isInitialized && (changes['latitude'] || changes['longitude'] || changes['zoom'])) {
      this.updateMap();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
      this.marker = undefined;
    }
  }

  private initializeDefaultIcon(): void {
    const anchorX = this.iconAnchor ? this.iconAnchor[0] : 16;
    const anchorY = this.iconAnchorY !== undefined ? this.iconAnchorY : (this.iconAnchor ? this.iconAnchor[1] : 16);
    
    const defaultIcon = L.icon({
      iconUrl: 'assets/icon/pin.png',
      iconSize: [32, 32],
      iconAnchor: [anchorX, anchorY], 
      popupAnchor: [0, -16]
    });

    L.Marker.prototype.options.icon = defaultIcon;
  }

  private initMap(): void {
    try {
      this.configureMapEvents();
      this.createMapInstance();
      this.addTileLayer();
      this.setupInitialMarkerAndView();
      this.finalizeInitialization();
    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
    }
  }

  private updateMap(): void {
    if (this.isUpdating || !this.map) {
      return;
    }

    this.isUpdating = true;

    try {
      this.prepareMapForUpdate();

      const lat = this.latitude || -3.7319;
      const lon = this.longitude || -38.5267;

      this.adjustView(lat, lon);
      this.finalizeUpdate();

      // Atualizar ou criar marcador exatamente nas coordenadas
      this.createOrUpdateMarker(lat, lon);

    } catch (error) {
      console.error('Erro ao atualizar mapa:', error);
    } finally {
      setTimeout(() => {
        this.isUpdating = false;
      }, 200);
    }
  }

  /**
   * Método público para adicionar um marcador no mapa
   */
  public addMarker(lat: number, lon: number, options?: L.MarkerOptions): L.Marker | null {
    if (!this.map) return null;

    const marker = L.marker([lat, lon], options).addTo(this.map);
    return marker;
  }

  /**
   * Método público para remover um marcador
   */
  public removeMarker(marker: L.Marker): void {
    if (this.map && marker) {
      this.map.removeLayer(marker);
    }
  }

  /**
   * Método público para ajustar o zoom
   */
  public setZoom(zoom: number): void {
    if (this.map) {
      this.map.setZoom(zoom);
    }
  }

  public setView(lat: number, lon: number, zoom?: number): void {
    if (this.map) {
      const adjustedLatLng = this.getAdjustedCenter(lat, lon);
      this.map.setView(adjustedLatLng, zoom || this.zoom);
      // Invalidar tamanho após mudança de view para garantir centralização
      this.invalidateMapSizeDelayed();
    }
  }

  /**
   * Método público para centralizar suavemente o mapa
   */
  public panTo(lat: number, lon: number): void {
    if (this.map) {
      this.map.panTo([lat, lon]);
      this.invalidateMapSizeDelayed();
    }
  }

  public centerOnMarker(): void {
    if (this.map && this.marker && this.latitude && this.longitude) {
      const adjustedLatLng = this.getAdjustedCenter(this.latitude, this.longitude);
      this.map.setView(adjustedLatLng, this.zoom);
      this.invalidateMapSizeDelayed();
    }
  }

  /**
   * Método público para obter a instância do mapa
   */
  public getMap(): L.Map | undefined {
    return this.map;
  }

  /**
   * Método público para invalidar o tamanho do mapa (útil após redimensionamento)
   */
  public invalidateSize(): void {
    if (this.map) {
      this.map.invalidateSize();
    }
  }
}
