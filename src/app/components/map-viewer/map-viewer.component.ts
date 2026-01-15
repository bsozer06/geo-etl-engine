import { Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import { GeoDataService } from '../../services/geo-data.service';
import { Fill, Stroke, Style } from 'ol/style.js';
import CircleStyle from 'ol/style/Circle';
import { FeatureLike } from 'ol/Feature';
import { buffer } from 'ol/extent';
import { isEmpty } from 'ol/extent';
import { CommonModule } from '@angular/common';
import { MapViewerService } from '../../services/map-viewer.service';
import { XYZ } from 'ol/source';
import { LayerPanelComponent } from "../layer-panel/layer-panel.component";
import StadiaMaps from 'ol/source/StadiaMaps';
import { MousePositionComponent } from "../mouse-position/mouse-position.component";
import { DrawingService } from '../../services/drawing.service';
import { ToolbarComponent } from "../toolbar/toolbar.component";


@Component({
  selector: 'app-map-viewer',
  standalone: true,
  imports: [CommonModule, LayerPanelComponent, MousePositionComponent, ToolbarComponent],
  templateUrl: './map-viewer.component.html',
  styleUrl: './map-viewer.component.scss',
})
export class MapViewerComponent {
  private _mapViewerService = inject(MapViewerService);
  private _geoDataService = inject(GeoDataService);
  private _drawService = inject(DrawingService);

  @ViewChild('mapContainer', { static: true })

  mapContainer!: ElementRef<HTMLDivElement>;
  map!: Map;
  importedDataVectorSource!: VectorSource;
  showExportMenu = false;

  public static readonly BASEMAP_CRS = 'EPSG:3857';
  public static readonly FALLBACK_CRS = 'EPSG:4326';

  constructor() {
    effect(() => {
      const data = this._geoDataService.currentData();
      console.log('data signal:', data);

      if (!data || !this.importedDataVectorSource) return;
      
      const geojsonFormat = new GeoJSON();
      let allFeatures: any[] = [];
      
      if (Array.isArray(data.geojson)) {
        data.geojson.forEach(collection => {
          const features = geojsonFormat.readFeatures(collection, {
            dataProjection: data.crs,
            featureProjection: MapViewerComponent.BASEMAP_CRS
          });
          allFeatures.push(...features);
        });
      } else {
        allFeatures = geojsonFormat.readFeatures(data.geojson, {
          dataProjection: data.crs,
          featureProjection: MapViewerComponent.BASEMAP_CRS
        });
      }

      this.importedDataVectorSource.clear();
      this.importedDataVectorSource.addFeatures(allFeatures);

    });

  }

  ngAfterViewInit(): void {
    this._initializeMap();
  }

  private _initializeMap(): void {
    this.importedDataVectorSource = new VectorSource();

    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [
        ...this._createBasemaps(),
        this._createImportedVectorLayer(),
        this._createDrawingVectorLayer()
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

  private _createImportedVectorLayer(): VectorLayer {
    const layer = new VectorLayer({
      source: this.importedDataVectorSource,
      style: this._styleByGeometryType
    });

    layer.setProperties({
      id: 'imported',
      name: 'Imported Data',
      type: 'vector',
      removable: false
    });

    return layer;
  }

  private _createDrawingVectorLayer(): VectorLayer {
    const layer = new VectorLayer({
      source: this._drawService.source,
      style: this._styleByGeometryType
    });

    layer.setProperties({
      id: 'drawing',
      name: 'Drawing Data',
      type: 'vector',
      removable: false
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
      removable: false,
      thumbnail: 'assets/map-previews/osm.webp'
    });

    const dark = new TileLayer({
      source: new StadiaMaps({
        layer: 'alidade_smooth_dark',
        retina: true,
      }),
      visible: false
    });

    dark.setProperties({
      id: 'Stadia Maps Dark',
      name: 'Stadia Maps Dark',
      type: 'basemap',
      removable: false,
      thumbnail: 'assets/map-previews/dark.webp'
    });

    return [osm, dark];
  }

}
