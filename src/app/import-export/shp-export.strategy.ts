import { FeatureCollection } from "geojson";
import { GeoJsonProjectionHelper } from "../helpers/geojson-projection.helper";
import { ExportStrategy } from "./interfaces/export-strategy.interface";
import shpwrite from '@mapbox/shp-write';

export class ShpExportStrategy implements ExportStrategy {

    readonly type = 'zip';

    async export(data: any): Promise<Blob> {
        if (data?.geojson === undefined || data?.crs === undefined) {
            throw new Error("Invalid data");
        }

        const geojson4326: FeatureCollection =
            GeoJsonProjectionHelper.toEPSG4326(
                data.geojson,
                data.crs
            );

        // Deep sanitize the GeoJSON object
        data.geojson.features.forEach((feature: any) => {
            if (!feature.properties) feature.properties = {};

            for (const key in feature.properties) {
                if (feature.properties[key] === undefined) {
                    feature.properties[key] = null; // or ""
                }
            }
        });

        const options = {
            folder: "export_layers",
            filename: "map_data",
            outputType: "blob",
            compression: "DEFLATE",
            types: {
                point: "points",
                polygon: "polygons",
                polyline: "lines",
            },
        };

        const shpZip = shpwrite.zip(
            geojson4326,
            options as any
        ) as Promise<Blob>;

        return shpZip;
    }
}
