import { Injectable, signal } from '@angular/core';
import { kml } from '@tmcw/togeojson';

@Injectable({
  providedIn: 'root',
})
export class GeoDataService {
  currentData = signal<GeoJSON.FeatureCollection | null>(null);

  async loadKml(file: File): Promise<void> {
    const text = await file.text();
    const xml = new DOMParser().parseFromString(text, 'text/xml');
    const geojson = kml(xml) as GeoJSON.FeatureCollection;
    this.currentData.set(geojson);
  }
}
