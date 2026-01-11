import { Injectable } from '@angular/core';
import Map from 'ol/Map';
import { Extent } from 'ol/extent';
import BaseLayer from 'ol/layer/Base';

@Injectable({
  providedIn: 'root',
})
export class MapViewerService {
   private _map?: Map;

  setMap(map: Map) {
    this._map = map;
  }

  getMap(): Map {
    if (!this._map) {
      throw new Error('Map is not initialized');
    }
    return this._map;
  }

  addLayer(layer: BaseLayer) {
    this.getMap().addLayer(layer);
  }

  removeLayer(layer: BaseLayer) {
    this.getMap().removeLayer(layer);
  }

  zoomToExtent(extent: Extent) {
    this.getMap().getView().fit(extent, {
      padding: [40, 40, 40, 40],
      duration: 400
    });
  }
}
