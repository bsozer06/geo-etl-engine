import { Component, effect, ElementRef, ViewChild } from '@angular/core';
import maplibregl, { Map } from 'maplibre-gl';
import { GeoDataService } from '../../services/geo-data.service';
import { UploadComponent } from "../upload/upload.component";

@Component({
  selector: 'app-map-viewer',
  imports: [UploadComponent],
  templateUrl: './map-viewer.component.html',
  styleUrl: './map-viewer.component.scss',
})
export class MapViewerComponent {
  @ViewChild('mapContainer', { static: true })
  mapContainer!: ElementRef<HTMLDivElement>;
  map!: Map;
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

      if (!data) return;
      const source = this.map.getSource('my-source') as maplibregl.GeoJSONSource;
      source.setData(data);
      console.log('source:', source);
    });

  }

  ngAfterViewInit(): void {
    this._initializeMap();
  }

  private _initializeMap(): void {
    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0, 0],
      zoom: 2
    });

    this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
    this.map.on('load', () => this._onMapLoad());
  }

  private _onMapLoad(): void {
    console.log('map is ready!');

    this._addGeoJsonSource();
    this._addPointLayer();
    this._addLineLayer();
    this._addPolygonLayers();
  }

  private _addGeoJsonSource(): void {
    this.map.addSource(this.SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
  }

  private _addPointLayer(): void {
    this.map.addLayer({
      id: this.LAYERS.POINT,
      type: 'circle',
      source: this.SOURCE_ID,
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-radius': 6,
        'circle-color': '#d11313'
      }
    });
  }

  private _addLineLayer(): void {
    this.map.addLayer({
      id: this.LAYERS.LINE,
      type: 'line',
      source: this.SOURCE_ID,
      filter: ['==', ['geometry-type'], 'LineString'],
      paint: {
        'line-width': 3,
        'line-color': '#005eff'
      }
    });
  }

  private _addPolygonLayers(): void {
    this.map.addLayer({
      id: this.LAYERS.POLYGON_FILL,
      type: 'fill',
      source: this.SOURCE_ID,
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {
        'fill-color': '#00ff99',
        'fill-opacity': 0.4
      }
    });

    this.map.addLayer({
      id: this.LAYERS.POLYGON_OUTLINE,
      type: 'line',
      source: this.SOURCE_ID,
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {
        'line-color': '#009966',
        'line-width': 2
      }
    });
  }



}
