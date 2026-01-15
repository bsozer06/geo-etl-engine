import { Injectable, signal } from '@angular/core';
import Map from 'ol/Map';
import { buffer, Extent, isEmpty } from 'ol/extent';
import BaseLayer from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import TileSource from 'ol/source/Tile';
import { Basemap } from '../models/basemap.model';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

@Injectable({
  providedIn: 'root',
})
export class MapViewerService {
  private readonly _map = signal<Map | null>(null);
  map = this._map.asReadonly();
  private readonly _vectorLayers = signal<BaseLayer[]>([]);
  vectorLayers = this._vectorLayers.asReadonly();

  setMap(map: Map) {
    this._map.set(map);
    this.refreshVectorLayers();
  }

  getLayersByType(type: 'basemap' | 'vector') {
    return this.map()!
      .getLayers()
      .getArray()
      .filter(l => l.get('type') === type);
  }

  setBasemapVisibility(basemap: Basemap) {
    const basemapLayers = this.getLayersByType('basemap');
    basemapLayers.forEach(layer => {
      layer.setVisible(false);
    });
    basemap.layer.setVisible(true);
  }

  zoomToVectorLayer(layer: BaseLayer) {
    const source = (layer as VectorLayer).getSource();
    if (!source) return;
    const extent = source.getExtent();
    if (!extent || extent.length === 0 || isEmpty(extent)) return;
    const map = this.map();
    if (!map) return;
    const view = map.getView();
    if (!view) return;
    const res = view.getResolution() as number;
    const bufferedExtent: Extent = buffer(extent, res * 20); // add some padding
    view.fit(bufferedExtent, { duration: 500 });
  }

  removeVectorLayer(layer: BaseLayer) {
    const map = this.map();
    if (map) {
      map.removeLayer(layer);
      this.refreshVectorLayers();
    }
  }

  refreshVectorLayers() {
    const map = this.map();
    if (map) {
      const layers = map.getLayers().getArray()
        .filter(l => l.get('type') === 'vector');
      this._vectorLayers.set([...layers]);
    }
  }

  /**
   * Retrieves the VectorSource from the 'Imported Data' layer.
   */
  getImportedSource(): VectorSource {
    const currentMap = this.map();
    if (!currentMap) {
      throw new Error('Map has not been initialized yet.');
    }

    // Find the layer by the ID we assigned in MapViewerComponent
    const layers = currentMap.getLayers().getArray();
    const importedLayer = layers.find(layer => 
      layer.get('id') === 'imported'
    ) as VectorLayer<VectorSource>;

    if (!importedLayer) {
      console.warn('Imported layer not found. Returning an empty source.');
      return new VectorSource();
    }

    return importedLayer.getSource() as VectorSource;
  }

}
