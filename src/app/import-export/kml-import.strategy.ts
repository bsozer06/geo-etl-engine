import KML from 'ol/format/KML';
import GeoJSON from 'ol/format/GeoJSON';
import { ImportedGeoData } from '../models/imported-geodata.model';
import { ImportStrategy } from './interfaces/import-strategy.interface';

export class KmlImportStrategy implements ImportStrategy {

  readonly type = 'kml';

  async import(file: File): Promise<ImportedGeoData> {
    const text = await file.text();

    const features = new KML({ extractStyles: false })
      .readFeatures(text);

    const geojson = new GeoJSON().writeFeaturesObject(features);

    return {
      geojson,
      crs: 'EPSG:4326' // ✅ KML standard
    };
  }
}
