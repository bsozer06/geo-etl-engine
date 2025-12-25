import { Component, effect, ElementRef, ViewChild } from '@angular/core';
import maplibregl, { Map } from 'maplibre-gl';
import { GeoDataService } from '../../services/geo-data.service';

@Component({
  selector: 'app-map-viewer',
  imports: [],
  templateUrl: './map-viewer.component.html',
  styleUrl: './map-viewer.component.scss',
})
export class MapViewerComponent {
  @ViewChild('mapContainer', { static: true })
  mapContainer!: ElementRef<HTMLDivElement>;

  map!: Map;

  constructor(private geoDataService: GeoDataService) {
     effect(() => {
      const data = this.geoDataService.currentData();
      
      if (!data) return;

      const source = this.map.getSource('my-source') as maplibregl.GeoJSONSource;
      source.setData(data);
    });
   }

  ngAfterViewInit(): void {
    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0, 0],
      zoom: 2
    });

    this.map.addControl(new maplibregl.NavigationControl(), 'top-right');

    this.map.on('load', () => {
      console.log('map is ready!');

      // add source
      this.map.addSource('my-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // add layer
      this.map.addLayer({
        id: 'my-layer',
        type: 'circle',
        source: 'my-source',
        paint: {
          'circle-radius': 5,
          'circle-color': '#007cbf'
        }
      });
    });

  }

}
