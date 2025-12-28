import { Injectable, signal } from '@angular/core';
// import { kml } from '@tmcw/togeojson';
import DxfParser from 'dxf-parser';
import KML from 'ol/format/KML';
import GeoJSON from 'ol/format/GeoJSON';
import type { FeatureCollection } from 'geojson';
import shp from 'shpjs';
import JSZip from 'jszip';
import { ProjectionHelper } from '../helpers/projection.helper';
import { ImportedGeoData } from '../models/imported-geodata.model';
import { KmlImportStrategy } from '../imports/kml-import.strategy';
import { ShpImportStrategy } from '../imports/shp-import.strategy';
import { ImportStrategy } from '../imports/import-strategy.interface';
import { GeojsonImportStrategy } from '../imports/geojson-import.strategy';


@Injectable({
  providedIn: 'root',
})
export class GeoDataService {
  private readonly dataSignal = signal<ImportedGeoData | null>(null);

  private readonly strategies: ImportStrategy[] = [
    new KmlImportStrategy(),
    new ShpImportStrategy(),
    new GeojsonImportStrategy(),
    // new DxfImportStrategy()
  ];

  currentData() {
    return this.dataSignal();
  }

  setData(data: ImportedGeoData) {
    this.dataSignal.set(data);
  }
  
  async import(file: File): Promise<void> {
    const ext = file.name.split('.').pop()?.toLowerCase();

    const strategy = this.strategies.find(s => s.type === ext);

    if (!strategy) {
      throw new Error(`Unsupported file type: ${ext}`);
    }

    const data = await strategy.import(file);
    this.dataSignal.set(data);
  }

}
