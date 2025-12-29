import GeoJSON from 'ol/format/GeoJSON';
import GPX from 'ol/format/GPX';

import { ImportedGeoData } from '../models/imported-geodata.model';
import { ImportStrategy } from './interfaces/import-strategy.interface';

export class GpxImportStrategy implements ImportStrategy {

  readonly type = 'gpx';

  async import(file: File): Promise<ImportedGeoData> {
    const text = await file.text();

    const features = new GPX()
      .readFeatures(text);

    const geojson = new GeoJSON().writeFeaturesObject(features);

    return {
      geojson,
      crs: 'EPSG:4326'
    };
  }
}
