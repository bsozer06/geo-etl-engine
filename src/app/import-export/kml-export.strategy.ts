import { Injectable } from '@angular/core';
import GeoJSON from 'ol/format/GeoJSON';
import KML from 'ol/format/KML';
import { transformExtent } from 'ol/proj';

import { ExportStrategy } from './interfaces/export-strategy.interface';
import { ImportedGeoData } from '../models/imported-geodata.model';

@Injectable({ providedIn: 'root' })
export class KmlExportStrategy implements ExportStrategy {

  readonly type = 'kml';

  export(data: ImportedGeoData): Blob {
    const geojsonFormat = new GeoJSON();

    // GeoJSON → OL Features
    const features = geojsonFormat.readFeatures(data.geojson, {
      dataProjection: data.crs,
      featureProjection: 'EPSG:4326' // KML standard
    });

    // OL Features → KML
    const kmlText = new KML({
      extractStyles: true
    }).writeFeatures(features, {
      featureProjection: 'EPSG:4326'
    });

    return new Blob([kmlText], {
      type: 'application/vnd.google-earth.kml+xml'
    });
  }
}
