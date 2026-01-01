import { FeatureCollection } from "geojson";
import { GeoJsonProjectionHelper } from "../helpers/geojson-projection.helper";
import { ExportStrategy } from "./interfaces/export-strategy.interface";
import shpwrite from '@mapbox/shp-write';

export class ShpExportStrategy implements ExportStrategy {

    readonly type = 'zip';

    async export(data: any): Promise<Blob> {
        const geojson4326: FeatureCollection =
            GeoJsonProjectionHelper.toEPSG4326(
                data.geojson,
                data.crs
            );

        const options = {
            folder: "my_internal_shapes_folder",
            filename: "my_zip_filename",
            outputType: "blob",
            compression: "DEFLATE",
            types: {
                point: "mypoints",
                polygon: "mypolygons",
                polyline: "mylines",
            },
        };

        const shpZip = shpwrite.zip(
            geojson4326,
            options as any
        ) as Promise<Blob>;

        return shpZip;
    }
}
