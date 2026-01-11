import { Injectable, signal } from '@angular/core';
import { MapLayer } from '../models/map-layer.model';

@Injectable({
  providedIn: 'root',
})
export class LayerService {
  private _layers = signal<MapLayer[]>([]);
  // private _activeLayerId = signal<string | null>(null);

  getLayers() {
    return this._layers();
  }

  add(layer: MapLayer) {
    this._layers.update(l => [...l, layer]);
  }

  remove(id: string) {
    this._layers.update(l => l.filter(x => x.id !== id));
  }

  toggleVisibility(id: string) {
     this._layers.update(l =>
      l.map(layer =>
        layer.id === id
          ? { ...layer, visible: !layer.visible }
          : layer
      )
    );
  }

}
