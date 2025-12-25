import { Component, ElementRef, ViewChild } from '@angular/core';
import maplibregl, { Map } from 'maplibre-gl';

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

  ngAfterViewInit(): void {
    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0, 0],
      zoom: 2
    });

    this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
  }
}
