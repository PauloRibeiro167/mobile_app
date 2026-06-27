import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private http = inject(HttpClient);

  private readonly NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
  private readonly SEARCH_ENDPOINT = 'search';
  private readonly REVERSE_ENDPOINT = 'reverse';
  private readonly FORMAT = 'format=json';
  private readonly COUNTRY_CODES = 'countrycodes=BR';
  private readonly LIMIT = 'limit=5';
  private readonly OPENSTREETMAP_EMBED_BASE = 'https://www.openstreetmap.org/export/embed.html';
  private readonly LAYER = 'layer=mapnik';

  buscarLocalizacao(params: { endereco?: string; lat?: number; lon?: number }): Observable<any> {
    let key = '';
    if (params.endereco) key = 'endereco';
    else if (params.lat !== undefined && params.lon !== undefined) key = 'coordenadas';
    else key = 'padrao';

    switch (key) {
      case 'endereco':
        const urlEndereco = `${this.NOMINATIM_BASE}/${this.SEARCH_ENDPOINT}?${this.FORMAT}&q=${encodeURIComponent(params.endereco!)}&${this.COUNTRY_CODES}&${this.LIMIT}`;
        
        return this.http.get<any>(urlEndereco).pipe(
          map(resultados => {
            
            if (Array.isArray(resultados)) {
              const resultadosProcessados = resultados.map((resultado: any) => ({
                ...resultado,
                zoom: this.calcularZoomDoBbox(resultado.boundingbox),
                bbox: this.converterBboxToString(resultado.boundingbox) || null
              }));
              return resultadosProcessados;
            } else {
              return [];
            }
          }),
          catchError(error => {
            return of([]);
          })
        );
      case 'coordenadas':
        const urlCoordenadas = `${this.NOMINATIM_BASE}/${this.REVERSE_ENDPOINT}?${this.FORMAT}&lat=${params.lat}&lon=${params.lon}`;
        return this.http.get<any>(urlCoordenadas).pipe(  
          map(resultado => {
            if (resultado && typeof resultado === 'object' && !Array.isArray(resultado)) {
              return {
                ...resultado,
                zoom: 20,
                bbox: this.converterBboxToString(resultado.boundingbox) || null
              };
            } else {
              return this.getLocalizacaoPadrao();
            }
          })
        );
      default:
        return of(this.getLocalizacaoPadrao());
    }
  }

  getLocalizacaoPadrao(): { latitude: number; longitude: number; bbox: string; zoom: number } {
    return {
      latitude: -3.7299315,
      longitude: -38.5263108,
      bbox: '-38.527,-3.731,-38.525,-3.728',
      zoom: 20 
    };
  }

  /**
   * Extrai coordenadas diretamente de um resultado da API SITFOR
   * Prioriza o campo 'localizacao' que agora vem na resposta da API
   */
  extrairCoordenadasDoResultado(resultado: any): { latitude?: number; longitude?: number } {
    if (!resultado) return {};
    // Se for array, pegar a primeira inscrição
    const inscricao = Array.isArray(resultado) ? resultado[0] : resultado;
    // Priorizar coordenadas diretas da API (campo localizacao)
    if (inscricao?.localizacao?.latitude && inscricao?.localizacao?.longitude) {
      return {
        latitude: parseFloat(inscricao.localizacao.latitude),
        longitude: parseFloat(inscricao.localizacao.longitude)
      };
    }
    return {};
  }

  getMapUrl(bbox: string, lat: number, lon: number, zoom: number): string {
    const bboxSize = 0.0006;
    const west = parseFloat((lon - bboxSize).toFixed(6));
    const south = parseFloat((lat - bboxSize).toFixed(6));
    const east = parseFloat((lon + bboxSize).toFixed(6));
    const north = parseFloat((lat + bboxSize).toFixed(6));
    const centeredBbox = `${west},${south},${east},${north}`;
    
    return `${this.OPENSTREETMAP_EMBED_BASE}?bbox=${centeredBbox}&${this.LAYER}`;
  }

  public converterBboxToString(bbox: string[]): string {
    if (!bbox || bbox.length < 4) return '';
    const [south, north, west, east] = bbox.map(parseFloat);
    return `${west},${south},${east},${north}`;
  }

  private calcularZoomDoBbox(bbox: string[]): number {
    if (!bbox || bbox.length < 4) return 20; 
    const [south, north, west, east] = bbox.map(parseFloat);
    const latDiff = north - south;
    const lonDiff = east - west;
    const maxDiff = Math.max(latDiff, lonDiff);
    const zoom = Math.floor(Math.log2(360 / maxDiff));
    return Math.max(1, Math.min(zoom, 20));
  }
}
