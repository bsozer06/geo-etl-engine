import { Injectable, signal } from '@angular/core';
import Map from 'ol/Map';
import { Extent } from 'ol/extent';
import BaseLayer from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import TileSource from 'ol/source/Tile';

@Injectable({
  providedIn: 'root',
})
export class MapViewerService {
    private readonly _map = signal<Map | null>(null);

    map = this._map.asReadonly();

  setMap(map: Map) {
    this._map.set(map);
  }

  getLayersByType(type: 'basemap' | 'vector') {
    return this.map()!
      .getLayers()
      .getArray()
      .filter(l => l.get('type') === type);
  }

}
