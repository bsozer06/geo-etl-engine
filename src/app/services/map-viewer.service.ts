import { Injectable, signal } from '@angular/core';
import Map from 'ol/Map';
import { buffer, Extent, isEmpty } from 'ol/extent';
import BaseLayer from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import TileSource from 'ol/source/Tile';
import { Basemap } from '../models/basemap.model';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Select from 'ol/interaction/Select';
import { pointerMove } from 'ol/events/condition';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import Feature, { FeatureLike } from 'ol/Feature';
import { asyncScheduler, debounceTime, distinctUntilChanged, Subject, throttleTime } from 'rxjs';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { getUid } from 'ol/util';

@Injectable({
  providedIn: 'root',
})
export class MapViewerService {
  rightClickedFeature = signal<any | null>(null);
  private readonly _map = signal<Map | null>(null);
  private readonly _hoveredFeatureInfo = signal<any | null>(null);
  private readonly _vectorLayers = signal<BaseLayer[]>([]);
  private hoverSubject = new Subject<MapBrowserEvent<any>>();
  private _highlightSource?: VectorSource;

  map = this._map.asReadonly();
  vectorLayers = this._vectorLayers.asReadonly();
  hoveredFeatureInfo = this._hoveredFeatureInfo.asReadonly();

  setMap(map: Map) {
    this._map.set(map);
    this._initialHoverInteraction(map);
    this.refreshVectorLayers();
  }

  handleRightClick(event: MouseEvent) {
    event.preventDefault();
    const map = this.map();
    if (!map) return;
    const pixel = map.getEventPixel(event);
    const feature = map.forEachFeatureAtPixel(pixel, (f) => f as Feature, {
      layerFilter: (l) => l.get('type') === 'vector',
      hitTolerance: 5
    });

    if (feature) {
      const properties = feature.getProperties();
      this.rightClickedFeature.set({
        ol_uid: getUid(feature),
        ...properties,
        clientX: event.clientX, 
        clientY: event.clientY,
        feature: feature
      });
    } else {
      this.rightClickedFeature.set(null);
    }
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

  getVectorSource(): VectorSource {
    const map = this.map();
    if (!map) throw new Error('Map not initialized');

    const layers = map.getLayers().getArray();
    const targetLayer = layers.find(l => l.get('id') === 'drawing') as VectorLayer<VectorSource>;

    if (targetLayer) {
      return targetLayer.getSource()!;
    }

    const fallbackLayer = layers.find(l => l.get('type') === 'vector') as VectorLayer<VectorSource>;
    return fallbackLayer ? fallbackLayer.getSource()! : new VectorSource();
  }

  private _initialHoverInteraction(map: Map) {
    this._highlightSource = new VectorSource();
    const _highlightLayer = new VectorLayer({
      source: this._highlightSource,
      style: this.HOVER_STYLE,
      zIndex: 9999,
    });
    map.addLayer(_highlightLayer);

    this.hoverSubject.pipe(
      throttleTime(16, asyncScheduler, { leading: true, trailing: true }),
      distinctUntilChanged((prev, curr) =>
        prev.pixel[0] === curr.pixel[0] && prev.pixel[1] === curr.pixel[1]
      ),
    ).subscribe((event: any) => {
      this._performHoverCheck(event, map);
    });

    map.on('pointermove', (e) => this.hoverSubject.next(e));
  }


  private readonly HOVER_STYLE = new Style({
    stroke: new Stroke({ color: '#fbbf24', width: 5 }),
    fill: new Fill({ color: 'rgba(251, 191, 36, 0.4)' }),
    image: new Circle({
      radius: 8,
      fill: new Fill({ color: '#fbbf24' }),
      stroke: new Stroke({ color: '#ffffff', width: 2 })
    })
  });

  private _performHoverCheck(event: MapBrowserEvent<any>, map: Map) {
    const feature = map.forEachFeatureAtPixel(event.pixel, (f) => f as Feature, {
      layerFilter: (l) => l.get('type') === 'vector',
      hitTolerance: 3
    });

    const currentUid = feature ? getUid(feature) : null;
    const lastUid = this.hoveredFeatureInfo()?.ol_uid;

    if (!this._highlightSource) return;

    if (currentUid === lastUid) return;

    this._highlightSource.clear(true);

    if (feature && feature instanceof Feature) {
      this._highlightSource.addFeature(feature);

      const { geometry, ...properties } = feature.getProperties();
      this._hoveredFeatureInfo.set({ ol_uid: currentUid, ...properties });

      map.getTargetElement().style.cursor = 'pointer';
    } else {
      this._hoveredFeatureInfo.set(null);
      map.getTargetElement().style.cursor = '';
    }
   
  }

}
