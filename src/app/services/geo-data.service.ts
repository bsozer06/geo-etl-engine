import { Injectable, signal } from '@angular/core';
import { kml } from '@tmcw/togeojson';
import DxfParser from 'dxf-parser';

@Injectable({
  providedIn: 'root',
})
export class GeoDataService {
  private readonly dataSignal = signal<GeoJSON.FeatureCollection | null>(null);

  currentData() {
    return this.dataSignal();
  }

  setData(data: GeoJSON.FeatureCollection) {
    this.dataSignal.set(data);
  }

  importKml(file: File) {
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

  private _convertDxfToGeoJSON(dxfText: string): GeoJSON.FeatureCollection {
    const parser = new DxfParser();
    const dxf = parser.parseSync(dxfText);

    const features: GeoJSON.Feature[] = [];
    console.log('dxf:', dxf);
    dxf?.entities.forEach((e: any) => {

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

  private _convertKmlToGeoJSON(kmlText: string): GeoJSON.FeatureCollection {
    const parser = new DOMParser();
    const kmlDom = parser.parseFromString(kmlText, 'text/xml');

    const parseError = kmlDom.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      throw new Error('Invalid KML file');
    }

    // const geojson = kml(kmlDom) as GeoJSON.FeatureCollection;
    const rawGeojson = kml(kmlDom) as GeoJSON.FeatureCollection;
    console.log('rawKml:', rawGeojson);
    
    // 🧹 Normalize 
    return {
      type: 'FeatureCollection',
      // features: geojson.features
      features: rawGeojson.features
        .filter(f => f.geometry) // remove null geometry
        .filter(f =>
          ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon']
            .includes(f.geometry!.type)
        )
        .map(f => ({
          type: 'Feature',
          geometry: f.geometry,
          properties: {
            ...f.properties
          }
        }))
    };
  }


  // async importKml(file: File) {
  //   try {
  //     const text = await file.text();
  //     const xml = new DOMParser().parseFromString(text, 'text/xml');
  //     const geojson = kml(xml) as GeoJSON.FeatureCollection;
  //     this.setData(geojson);
  //   } catch (err) {
  //     console.error('KML parse error', err);
  //     throw err;
  //   }
  // }


}
