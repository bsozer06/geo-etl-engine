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
import { KmlImportStrategy } from '../import-export/kml-import.strategy';
import { ShpImportStrategy } from '../import-export/shp-import.strategy';
import { ImportStrategy } from '../import-export/interfaces/import-strategy.interface';
import { GeojsonImportStrategy } from '../import-export/geojson-import.strategy';
import { GpxImportStrategy } from '../import-export/gpx-import.strategy';
import { WktImportStrategy } from '../import-export/wkt-import.strategy';
import { ExportStrategy } from '../import-export/interfaces/export-strategy.interface';
import { KmlExportStrategy } from '../import-export/kml-export.strategy';
import { ShpExportStrategy } from '../import-export/shp-export.strategy';


@Injectable({
  providedIn: 'root',
})
export class GeoDataService {
  private readonly dataSignal = signal<ImportedGeoData | null>(null);

  private readonly _importStrategies: ImportStrategy[] = [
    new KmlImportStrategy(),
    new ShpImportStrategy(),
    new GeojsonImportStrategy(),
    new GpxImportStrategy(),
    new WktImportStrategy()
    // new DxfImportStrategy()
  ];

  private readonly _exportStrategies: ExportStrategy[] = [
    new KmlExportStrategy(),
    new ShpExportStrategy()
  ]

  currentData() {
    return this.dataSignal();
  }

  setData(data: ImportedGeoData) {
    this.dataSignal.set(data);
  }

  async import(file: File): Promise<void> {
    const ext = file.name.split('.').pop()?.toLowerCase();

    const strategy = this._importStrategies.find(s => s.type === ext);

    if (!strategy) throw new Error(`Unsupported file type: ${ext}`);

    const data = await strategy.import(file);
    this.dataSignal.set(data);
  }

  async export(type: string): Promise<Blob> {
    const data = this.dataSignal();
    if (!data) {
      throw new Error('No geo data loaded');
    }
    if (type === 'shp') {
      type = 'zip';
    }

    const strategy = this._exportStrategies.find(s => s.type === type);

    if (!strategy) throw new Error(`Export strategy not found: ${type}`);
    
    return await strategy.export(data);
  }

}
