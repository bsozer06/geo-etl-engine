import { Injectable, signal } from '@angular/core';
import { MapLayer } from '../models/maplayer.model';

@Injectable({
  providedIn: 'root',
})
export class LayerService {
  private _layers = signal<MapLayer[]>([]);
  private _activeLayerId = signal<string | null>(null);

  getLayers() {
    return this._layers();
  }

  add(layer: MapLayer) {
    this._layers.update(l => [...l, layer]);
    this._activeLayerId.set(layer.id);
  }

  remove(id: string) {
    this._layers.update(l => l.filter(x => x.id !== id));
  }

  toggle(id: string) {
    this._layers.update(layers =>
      layers.map(l => {
        if (l.id === id) {
          l.layer.setVisible(!l.visible);
          return { ...l, visible: !l.visible };
        }
        return l;
      })
    );
  }

  setActive(id: string) {
    this._activeLayerId.set(id);
  }

  getActive() {
    return this._layers().find(l => l.id === this._activeLayerId());
  }
}
