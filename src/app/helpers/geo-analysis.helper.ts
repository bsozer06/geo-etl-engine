import * as turf from '@turf/turf';
import { GeoJSON, WKT } from 'ol/format';
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

    static calculateMeasurement(olFeature: any): { value: string, label: string } {
        const geojson = this.format.writeFeatureObject(olFeature, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });

        const type = olFeature.getGeometry()?.getType();

        if (type.includes('Polygon')) {
            const area = turf.area(geojson); // m²
            const formattedArea = area > 10000
                ? (area / 10000).toFixed(2) + ' ha'
                : area.toFixed(2) + ' m²';
            return { value: formattedArea, label: 'Area' };
        } else {
            const length = turf.length(geojson, { units: 'kilometers' });
            const formattedLength = length < 1
                ? (length * 1000).toFixed(2) + ' m'
                : length.toFixed(2) + ' km';
            return { value: formattedLength, label: 'Length' };
        }
    }

    static getCentroid(olFeature: any): Feature {
        const geojson = this.format.writeFeatureObject(olFeature, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });

        const centroid = turf.centroid(geojson);

        return this.format.readFeature(centroid, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        }) as Feature;
    }

    static getLineMiddlePoint(olFeature: any): Feature {
        const geojson = this.format.writeFeatureObject(olFeature, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });


        const lineData = geojson as any;
        const lineLength = turf.length(lineData);

        const middlePoint = turf.along(lineData, lineLength / 2);

        return this.format.readFeature(middlePoint, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        }) as Feature;
    }

    static convertToWKT(olFeature: any): string {
        const wktFormat = new WKT();
        return wktFormat.writeFeature(olFeature, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
    }

    // static async searchSTAC(geometry: any, dateRange: string) {
    //     const bbox = turf.bbox(geometry); // [minX, minY, maxX, maxY]

    //     const searchParams = {
    //         bbox: bbox,
    //         datetime: dateRange, // "2023-01-01T00:00:00Z/2023-12-31T23:59:59Z"
    //         collections: ["sentinel-2-l2a"],
    //         limit: 10
    //     };

    //     const response = await fetch("https://earth-search.aws.element84.com/v1/search", {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(searchParams)
    //     });

    //     return await response.json();
    // }

}
