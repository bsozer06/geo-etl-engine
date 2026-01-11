import { Injectable, signal } from '@angular/core';
import { Basemap } from '../models/basemap.model';

@Injectable({
  providedIn: 'root',
})
export class BasemapService {
  private _basemaps: Basemap[] = [];
  private _activeId = signal<string | null>(null);

  register(basemap: Basemap) {
    this._basemaps.push(basemap);
  }

  getBasemaps() {
    return this._basemaps;
  }

  activate(id: string) {
    this._basemaps.forEach(bm => {
      bm.layer.setVisible(bm.id === id);
    });
    this._activeId.set(id);
  }

  getActive() {
    return this._activeId();
  }
}
