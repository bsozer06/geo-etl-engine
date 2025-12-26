import { Component, effect, ElementRef, ViewChild } from '@angular/core';
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


@Component({
  selector: 'app-map-viewer',
  standalone: true,
  imports: [UploadComponent],
  templateUrl: './map-viewer.component.html',
  styleUrl: './map-viewer.component.scss',
})
export class MapViewerComponent {
  @ViewChild('mapContainer', { static: true })
  mapContainer!: ElementRef<HTMLDivElement>;
  map!: Map;
  vectorSource!: VectorSource;

  constructor(private geoDataService: GeoDataService) {

    effect(() => {
      const data = this.geoDataService.currentData();
      console.log('data signal:', data);

      if (!data || !this.vectorSource) return;

      const geojson = data.geojson;
      const dataCrs = data.crs ?? 'EPSG:4326'; // ⬅️ fallback

      const features = new GeoJSON().readFeatures(geojson, {
        dataProjection: dataCrs,
        featureProjection: 'EPSG:3857'    // !!! Basemap projection !!!
      });

      this.vectorSource.clear();
      this.vectorSource.addFeatures(features);
    });

  }

  ngAfterViewInit(): void {
    this._initializeMap();
  }

  private _initializeMap(): void {
    this.vectorSource = new VectorSource();

    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: this._styleByGeometryType
    });

    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
        projection: 'EPSG:3857'
      })
    });

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
}
