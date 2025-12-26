import { Injectable, signal } from '@angular/core';
// import { kml } from '@tmcw/togeojson';
import DxfParser from 'dxf-parser';
import KML from 'ol/format/KML';
import GeoJSON from 'ol/format/GeoJSON';
import type { FeatureCollection } from 'geojson';

@Injectable({
  providedIn: 'root',
})
export class GeoDataService {
  private readonly dataSignal = signal<FeatureCollection | null>(null);

  currentData() {
    return this.dataSignal();
  }

  setData(data: GeoJSON.FeatureCollection) {
    this.dataSignal.set(data);
  }

  importKml(file: File): void {
    this.readFileAsText(file).then(text => {
      const geojson = this._convertKmlToGeoJSON(text);
      this.setData(geojson);
    });
  }

  importDxf(file: File) {
    this.readFileAsText(file).then(text => {
      const geojson = this._convertDxfToGeoJSON(text);
      this.setData(geojson);
    });
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

   private _convertDxfToGeoJSON(dxfText: string): FeatureCollection {
    const parser = new DxfParser();
    const dxf = parser.parseSync(dxfText);

    const features: GeoJSON.Feature[] = [];

    dxf?.entities?.forEach((e: any) => {

      if (e.type === 'POINT') {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [e.position.x, e.position.y]
          },
          properties: { layer: e.layer }
        });
      }

      if (e.type === 'LINE') {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [e.start.x, e.start.y],
              [e.end.x, e.end.y]
            ]
          },
          properties: { layer: e.layer }
        });
      }

      if (e.type === 'LWPOLYLINE') {
        const coords = e.vertices.map((v: any) => [v.x, v.y]);

        features.push({
          type: 'Feature',
          geometry: {
            type: e.closed ? 'Polygon' : 'LineString',
            coordinates: e.closed ? [coords] : coords
          },
          properties: { layer: e.layer }
        });
      }
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }

  private _convertKmlToGeoJSON(kmlText: string): FeatureCollection {
    const kmlFormat = new KML({
      extractStyles: false
    });

    // KML → OL Features
    const features = kmlFormat.readFeatures(kmlText, {
      dataProjection: 'EPSG:4326',     // KML standard
      featureProjection: 'EPSG:3857'   // Map projection
    });

    // OL Features → GeoJSON
    const geojson = new GeoJSON().writeFeaturesObject(features);

    return {
      type: 'FeatureCollection',
      features: geojson.features.filter(f => f.geometry)
    };
  }


}
