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
  private readonly _layers = signal<any[]>([]);

  private hoverSubject = new Subject<MapBrowserEvent<any>>();
  private _highlightSource?: VectorSource;
  map = this._map.asReadonly();
  vectorLayers = this._vectorLayers.asReadonly();
  hoveredFeatureInfo = this._hoveredFeatureInfo.asReadonly();
  layers = this._layers.asReadonly();
  selectedStacItem = signal<any | null>(null);

  setMap(map: Map) {
    this._map.set(map);
    this._initialHoverInteraction(map);
    // this.refreshVectorLayers();
    this.refreshLayers();
  }

  selectStacItem(item: any) {
    this.selectedStacItem.set(item);
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

    // if (feature) {
    //   const properties = feature.getProperties();
      // this.rightClickedFeature.set({
      //   ol_uid: getUid(feature),
      //   ...properties,
      //   clientX: event.clientX,
      //   clientY: event.clientY,
      //   feature: feature
      // });
      this.rightClickedFeature.set({
        ol_uid: feature ? getUid(feature) : null,
        ...(feature ? feature.getProperties() : {}),
        clientX: event.clientX,
        clientY: event.clientY,
        pixel: pixel,
        feature: feature || null, // null ise boşluğa tıklandı demektir
        isMapClick: !feature // Vektör feature yoksa bu bir harita tıklamasıdır
      });
    // } else {
    //   this.rightClickedFeature.set(null);
    // }
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

  zoomToLayer(layer: any) {
    const map = this.map();
    if (!map) return;

    if (layer.get('type') === 'stac') {
      const extent = layer.getExtent();
      if (extent) map.getView().fit(extent, { duration: 500, padding: [20, 20, 20, 20] });
      return;
    }

    const source = layer.getSource();
    if (source && source.getExtent) {
      const extent = source.getExtent();
      if (!isEmpty(extent)) map.getView().fit(extent, { duration: 500 });
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

  refreshLayers() {
    const map = this.map();
    if (!map) return;

    const allLayers = map.getLayers().getArray().filter(l =>
      l.get('name') && l.get('type') !== 'basemap'
    );

    this._layers.set([...allLayers]);
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

  applyNDVI() {
  const map = this.map();
  if (!map) return;

  // Haritadaki tüm katmanları kontrol et ve tipi 'stac' olanı bul
  const stacLayer = map.getLayers().getArray().find(l => l.get('type') === 'stac') as any;

  if (stacLayer) {
    const ndviStyle = {
      color: [
        'interpolate',
        ['linear'],
        ['/', 
          ['-', ['band', 8], ['band', 4]], 
          ['+', ['band', 8], ['band', 4]]
        ],
        -0.1, [255, 0, 0],    // Su / Yerleşim (Kırmızı)
        0.1, [255, 255, 0],   // Açık toprak (Sarı)
        0.3, [144, 238, 144], // Az bitki (Açık Yeşil)
        0.6, [34, 139, 34],   // Sağlıklı (Yeşil)
        0.9, [0, 100, 0]      // Yoğun orman (Koyu Yeşil)
      ]
    };

    // ol-stac katmanları genellikle bir gruptur. 
    // Eğer doğrudan setStyle yoksa içindeki asıl render layer'ına ulaşırız:
    if (stacLayer.getLayers) {
       const subLayer = stacLayer.getLayers().getArray()[1];
       if (subLayer) subLayer.set('style', ndviStyle);
    } else {
       // Eğer doğrudan layer ise:
       stacLayer.set('style', ndviStyle);
    }
    
    stacLayer.set('isNDVI', true);
  }
}

  resetStacStyle() {
  const map = this.map();
  if (!map) return;

  const stacLayer = map.getLayers().getArray().find(l => l.get('type') === 'stac') as any;

  if (stacLayer) {
    const trueColorStyle = {
      color: [
        'array',
        ['band', 4], // Red
        ['band', 3], // Green
        ['band', 2], // Blue
        1            // Opacity
      ]
    };

    if (stacLayer.getLayers) {
       const subLayer = stacLayer.getLayers().getArray()[1];
       if (subLayer) subLayer.set('style', trueColorStyle);
    } else {
       stacLayer.set('style', trueColorStyle);
    }
    
    stacLayer.set('isNDVI', false);
  }
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
