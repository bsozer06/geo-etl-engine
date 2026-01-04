import { FeatureCollection } from "geojson";
import { ImportedGeoData } from "../models/imported-geodata.model";
import { ExportStrategy } from "./interfaces/export-strategy.interface";
import { GeoJsonProjectionHelper } from "../helpers/geojson-projection.helper";

export class GeojsonExportStrategy implements ExportStrategy {
    readonly type = 'geojson';

    async export(file: ImportedGeoData): Promise<Blob> {
        const geojson4326: FeatureCollection =
            GeoJsonProjectionHelper.toEPSG4326(
                file.geojson,
                file.crs
            );

        const json = JSON.stringify(geojson4326, null, 2);

        return new Blob([json], {
            type: 'application/geo+json'
        });
    }

}