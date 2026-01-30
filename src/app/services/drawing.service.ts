import { inject, Injectable, NgZone, signal } from '@angular/core';
import VectorSource from 'ol/source/Vector';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import Map from 'ol/Map';

@Injectable({
  providedIn: 'root',
})
export class DrawingService {

  private readonly _drawSource = new VectorSource();
  private readonly _stacDrawSource = new VectorSource();
  private _activeDrawInteraction: Draw | null = null;
  private _activeStacDrawInteraction: Draw | null = null;
  activeType = signal<'Point' | 'LineString' | 'Polygon' | null>(null);

  get source() {
    return this._drawSource;
  }

  get stacSource() {
    return this._stacDrawSource;
  }

  startDrawing(map: Map, type: 'Point' | 'LineString' | 'Polygon', callback?: (feature: any) => void) {
    this.stopDrawing(map); // clean up any existing interaction

    this._activeDrawInteraction = new Draw({
      source: this._drawSource,
      type: type
    });

    if (callback) {
      this._activeDrawInteraction.on('drawend', (event: DrawEvent) => {
        callback(event.feature);
        this.stopDrawing(map);
      });
    }

    map.addInteraction(this._activeDrawInteraction);
    this.activeType.set(type);
  }

  startStacDrawing(map: Map, callback?: (feature: any) => void) {
    this.stopStacDrawing(map);
    this._activeStacDrawInteraction = new Draw({
      source: this._stacDrawSource,
      type: 'Polygon'
    });
    if (callback) {
      this._activeStacDrawInteraction.on('drawend', (event: DrawEvent) => {
        callback(event.feature);
        this.stopStacDrawing(map);
      });
    }
    map.addInteraction(this._activeStacDrawInteraction);
  }

  stopDrawing(map: Map) {
    if (this._activeDrawInteraction) {
      map.removeInteraction(this._activeDrawInteraction);
      this._activeDrawInteraction = null;
    }
    this.activeType.set(null);
  }

  stopStacDrawing(map: Map) {
    if (this._activeStacDrawInteraction) {
      map.removeInteraction(this._activeStacDrawInteraction);
      this._activeStacDrawInteraction = null;
    }
  }

  clearDrawings() {
    this._drawSource.clear();
  }

  clearStacDrawings() {
    this._stacDrawSource.clear();
  }
}