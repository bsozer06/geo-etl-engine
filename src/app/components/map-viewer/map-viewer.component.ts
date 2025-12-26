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
 import {Circle, Fill, Stroke, Style} from 'ol/style.js';


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

  private readonly SOURCE_ID = 'my-source';
  private readonly LAYERS = {
    POINT: 'point-layer',
    LINE: 'line-layer',
    POLYGON_FILL: 'polygon-fill-layer',
    POLYGON_OUTLINE: 'polygon-outline-layer'
  };

  constructor(private geoDataService: GeoDataService) {

    effect(() => {
      const data = this.geoDataService.currentData();
      console.log('data signal:', data);

      if (!data || !this.vectorSource) return;

      const features = new GeoJSON().readFeatures(data, {
        featureProjection: 'EPSG:3857'
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

    // this.map = new maplibregl.Map({
    //   container: this.mapContainer.nativeElement,
    //   style: 'https://demotiles.maplibre.org/style.json',
    //   center: [0, 0],
    //   zoom: 2
    // });

    // this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
    // this.map.on('load', () => this._onMapLoad());
  }

  private _styleByGeometryType = (feature: any) => {
    const type = feature.getGeometry().getType();

    switch (type) {
      case 'Point':
        return new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({ color: '#d11313' })
          })
        });

      case 'LineString':
        return new Style({
          stroke: new Stroke({
            color: '#005eff',
            width: 3
          })
        });

      case 'Polygon':
        return [
          new Style({
            fill: new Fill({
              color: 'rgba(0,255,153,0.4)'
            })
          }),
          new Style({
            stroke: new Stroke({
              color: '#009966',
              width: 2
            })
          })
        ];

      default:
        return undefined;
    }
  };


  // private _onMapLoad(): void {
  //   console.log('map is ready!');

  //   this._addGeoJsonSource();
  //   this._addPointLayer();
  //   this._addLineLayer();
  //   this._addPolygonLayers();
  // }

  // private _addGeoJsonSource(): void {
  //   this.map.addSource(this.SOURCE_ID, {
  //     type: 'geojson',
  //     data: {
  //       type: 'FeatureCollection',
  //       features: []
  //     }
  //   });
  // }

  // private _addPointLayer(): void {
  //   this.map.addLayer({
  //     id: this.LAYERS.POINT,
  //     type: 'circle',
  //     source: this.SOURCE_ID,
  //     filter: ['==', ['geometry-type'], 'Point'],
  //     paint: {
  //       'circle-radius': 6,
  //       'circle-color': '#d11313'
  //     }
  //   });
  // }

  // private _addLineLayer(): void {
  //   this.map.addLayer({
  //     id: this.LAYERS.LINE,
  //     type: 'line',
  //     source: this.SOURCE_ID,
  //     filter: ['==', ['geometry-type'], 'LineString'],
  //     paint: {
  //       'line-width': 3,
  //       'line-color': '#005eff'
  //     }
  //   });
  // }

  // private _addPolygonLayers(): void {
  //   this.map.addLayer({
  //     id: this.LAYERS.POLYGON_FILL,
  //     type: 'fill',
  //     source: this.SOURCE_ID,
  //     filter: ['==', ['geometry-type'], 'Polygon'],
  //     paint: {
  //       'fill-color': '#00ff99',
  //       'fill-opacity': 0.4
  //     }
  //   });

  //   this.map.addLayer({
  //     id: this.LAYERS.POLYGON_OUTLINE,
  //     type: 'line',
  //     source: this.SOURCE_ID,
  //     filter: ['==', ['geometry-type'], 'Polygon'],
  //     paint: {
  //       'line-color': '#009966',
  //       'line-width': 2
  //     }
  //   });
  // }



}
