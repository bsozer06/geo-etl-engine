// helpers/geojson-projection.helper.ts
import GeoJSON from 'ol/format/GeoJSON';
import type { FeatureCollection } from 'geojson';

export class GeoJsonProjectionHelper {

    static toEPSG4326(
        geojson: FeatureCollection,
        sourceCrs: string
    ): FeatureCollection {

        if (sourceCrs === 'EPSG:4326') {
            return geojson;
        }

        const format = new GeoJSON();

        const features = format.readFeatures(geojson, {
            dataProjection: sourceCrs,
            featureProjection: 'EPSG:4326'
        });

        return format.writeFeaturesObject(features);
    }
}
