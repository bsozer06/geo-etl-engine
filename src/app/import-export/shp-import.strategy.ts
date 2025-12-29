import shp from 'shpjs';
import JSZip from 'jszip';
import { ProjectionHelper } from '../helpers/projection.helper';
import { ImportedGeoData } from '../models/imported-geodata.model';
import { ImportStrategy } from './interfaces/import-strategy.interface';

export class ShpImportStrategy implements ImportStrategy {

  readonly type = 'zip';

  async import(file: File): Promise<ImportedGeoData> {
    const buffer = await file.arrayBuffer();
    let crs = 'EPSG:4326';

    const geojson = await shp(buffer) as GeoJSON.FeatureCollection;;

    const prj = await this.extractPrj(file);
    if (prj) {
      crs = ProjectionHelper.registerWktProjection(prj);
    }

    return { geojson, crs };
  }

  private async extractPrj(file: File): Promise<string | null> {
    const zip = await JSZip.loadAsync(file);

    const prjFile = Object.values(zip.files)
      .find(f => f.name.toLowerCase().endsWith('.prj'));

    return prjFile ? await prjFile.async('text') : null;
  }
}
