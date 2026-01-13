import { Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import { GeoDataService } from '../../services/geo-data.service';
import { UploadComponent } from "../upload/upload.component";
import { Fill, Stroke, Style } from 'ol/style.js';
import CircleStyle from 'ol/style/Circle';
import { FeatureLike } from 'ol/Feature';
import { buffer } from 'ol/extent';
import { isEmpty } from 'ol/extent';
import { CommonModule } from '@angular/common';
import { MapViewerService } from '../../services/map-viewer.service';
import { XYZ } from 'ol/source';
import { LayerPanelComponent } from "../layer-panel/layer-panel.component";


@Component({
  selector: 'app-map-viewer',
  standalone: true,
  imports: [UploadComponent, CommonModule, LayerPanelComponent],
  templateUrl: './map-viewer.component.html',
  styleUrl: './map-viewer.component.scss',
})
export class MapViewerComponent {
  private _mapViewerService = inject(MapViewerService);
  private _geoDataService = inject(GeoDataService);

  @ViewChild('mapContainer', { static: true })

  mapContainer!: ElementRef<HTMLDivElement>;
  map!: Map;
  vectorSource!: VectorSource;
  showExportMenu = false;

  public static readonly BASEMAP_CRS = 'EPSG:3857';

  constructor() {

    effect(() => {
      const data = this._geoDataService.currentData();
      console.log('data signal:', data);

      if (!data || !this.vectorSource) return;

      // const geojson = data.geojson;
      // const dataCrs = data.crs ?? 'EPSG:4326'; // ⬅️ fallback

      const features = new GeoJSON().readFeatures(data.geojson, {
        dataProjection: data.crs ?? 'EPSG:4326', // ⬅️ fallback
        featureProjection: MapViewerComponent.BASEMAP_CRS
      });

      this.vectorSource.clear();
      this.vectorSource.addFeatures(features);

      // this._zoomToFeatures();
    });

  }

  ngAfterViewInit(): void {
    this._initializeMap();
  }

  async export(format: string): Promise<void> {
    try {
      if (format === 'kml' || format === 'gpx' || format === 'zip' || format === 'geojson') {
        const blob = await this._geoDataService.export(format);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert(err instanceof Error ? err.message : 'Export failed');
    }
  }

  toggleExportMenu() {
    this.showExportMenu = !this.showExportMenu;
  }

  private _initializeMap(): void {
    this.vectorSource = new VectorSource();

    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [
        ...this._createBasemaps(),
        this._createVectorLayer()
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
        projection: MapViewerComponent.BASEMAP_CRS
      })
    });
    this._mapViewerService.setMap(this.map);

  }

  private _styleByGeometryType = (feature: FeatureLike): Style => {
    const type = feature.getGeometry()?.getType();
    console.log('style called for:', type);
    return this._styleCache[type ?? 'Point'];
  };

  // private _zoomToFeatures(): void {
  //   const source = this.vectorSource;

  //   if (!source) return;

  //   let extent = source.getExtent();

  //   // if (!extent || extent.some(v => !isFinite(v))) return;
  //   if (isEmpty(extent)) return;

  //   // Point / very small geometry fix
  //   if (
  //     extent[0] === extent[2] &&
  //     extent[1] === extent[3]
  //   ) {
  //     extent = buffer(extent, 50); // meters (EPSG:3857)
  //   }

  //   this.map.getView().fit(extent, {
  //     padding: [40, 40, 40, 40],
  //     duration: 600,
  //     maxZoom: 17
  //   })

  // }

  private readonly _styleCache: Record<string, Style> = {
    Point: new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: '#d11313' })
      })
    }),

    LineString: new Style({
      stroke: new Stroke({
        color: '#005eff',
        width: 3
      })
    }),

    MultiLineString: new Style({
      stroke: new Stroke({
        color: '#0752d4ff',
        width: 3
      })
    }),

    Polygon: new Style({
      fill: new Fill({
        color: 'rgba(0,255,153,0.4)'
      }),
      stroke: new Stroke({
        color: '#009966',
        width: 2
      })
    })
  };

  private _createVectorLayer(): VectorLayer {
    const layer = new VectorLayer({
      source: this.vectorSource,
      style: this._styleByGeometryType
    });

    layer.setProperties({
      id: 'imported',
      name: 'Imported Data',
      type: 'vector',
      removable: true
    });

    return layer;
  }

  private _createBasemaps(): TileLayer[] {
    const osm = new TileLayer({
      source: new OSM(),
      visible: true
    });

    osm.setProperties({
      id: 'osm',
      name: 'OpenStreetMap',
      type: 'basemap',
      removable: false
    });

    const dark = new TileLayer({
      source: new XYZ({
        url: 'https://tiles.stadiamaps.com/tiles/alidade_dark/{z}/{x}/{y}.png'
      }),
      visible: false
    });

    dark.setProperties({
      id: 'dark',
      name: 'Dark',
      type: 'basemap',
      removable: false
    });

    return [osm, dark];
  }

}
