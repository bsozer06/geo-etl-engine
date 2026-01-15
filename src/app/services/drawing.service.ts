import { Injectable, signal } from '@angular/core';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import Map from 'ol/Map';

@Injectable({
  providedIn: 'root',
})
export class DrawingService {
  
  private readonly _drawSource = new VectorSource();
  private _activeDrawInteraction: Draw | null = null;
  activeType = signal<'Point' | 'LineString' | 'Polygon' | null>(null);

  get source() {
    return this._drawSource;
  }

  startDrawing(map: Map, type: 'Point' | 'LineString' | 'Polygon') {
    this.stopDrawing(map); // clean up any existing interaction

    this._activeDrawInteraction = new Draw({
      source: this._drawSource,
      type: type
    });

    map.addInteraction(this._activeDrawInteraction);
    this.activeType.set(type);
  }

  stopDrawing(map: Map) {
    if (this._activeDrawInteraction) {
      map.removeInteraction(this._activeDrawInteraction);
      this._activeDrawInteraction = null;
    }
    this.activeType.set(null);
  }

  clearDrawings() {
    this._drawSource.clear();
  }
}
