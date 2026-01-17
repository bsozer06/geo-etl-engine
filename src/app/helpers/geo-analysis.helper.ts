import * as turf from '@turf/turf';
import { GeoJSON } from 'ol/format';
import { Feature } from 'ol';

export class GeoAnalysisHelper {
    private static format = new GeoJSON();

    static createBuffer(olFeature: Feature, distance: number): Feature {
        const geojson = this.format.writeFeatureObject(olFeature, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        const buffered = turf.buffer(geojson, distance, { units: 'meters' });
        return this.format.readFeature(buffered, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        }) as Feature;
    }

    static calculateMeasurement(olFeature: Feature): { value: number; unit: string; type: string } {
        const geojson = this.format.writeFeatureObject(olFeature);
        const geometryType = olFeature.getGeometry()?.getType();

        if (geometryType?.includes('Polygon')) {
            return {
                value: turf.area(geojson),
                unit: 'm²',
                type: 'Area'
            };
        } else {
            const length = turf.length(geojson, { units: 'kilometers' });
            return {
                value: length,
                unit: 'km',
                type: 'Length'
            };
        }
    }

    static getCentroid(olFeature: Feature): Feature {
        const geojson = this.format.writeFeatureObject(olFeature);
        const centroid = turf.centroid(geojson);
        return this.format.readFeature(centroid) as Feature;
    }

}
