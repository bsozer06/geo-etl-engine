import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';

import { ImportedGeoData } from '../models/imported-geodata.model';
import { ImportStrategy } from './import-strategy.interface';

export class WktImportStrategy implements ImportStrategy {

  readonly type = 'wkt';

  async import(file: File): Promise<ImportedGeoData> {
    const text = await file.text();

    const features = new WKT()
      .readFeatures(text);

    const geojson = new GeoJSON().writeFeaturesObject(features);

    return {
      geojson,
      crs: 'EPSG:4326'
    };
  }
}
