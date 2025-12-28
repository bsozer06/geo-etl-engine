import { FeatureCollection } from "geojson";
import { ImportedGeoData } from "../models/imported-geodata.model";
import { ImportStrategy } from "./import-strategy.interface";

export class GeojsonImportStrategy implements ImportStrategy {
    readonly type = 'geojson';

    async import(file: File): Promise<ImportedGeoData> {
        const text = await file.text();
        const geojson = JSON.parse(text);

        this._validate(geojson);

        return {
            geojson,
            crs: this._detectCrs(geojson)
        };
    }

    private _detectCrs(geojson: FeatureCollection): string {
        // Legacy GeoJSON CRS support
        const crsName = (geojson as any)?.crs?.properties?.name;
        console.log('crsName:', crsName);
        return crsName ?? 'EPSG:4326';
    }


    private _validate(geojson: FeatureCollection): void {
        if (geojson.type !== 'FeatureCollection') {
            throw new Error('Invalid GeoJSON: not a FeatureCollection');
        }

        if (!Array.isArray(geojson.features)) {
            throw new Error('Invalid GeoJSON: features missing');
        }
    }
}