import { Injectable } from '@angular/core';
import * as turf from '@turf/turf';
import { GeoJSON } from 'ol/format';

@Injectable({
  providedIn: 'root',
})
export class StacService {
  private readonly STAC_API_URL = 'https://earth-search.aws.element84.com/v1/search';

  private format = new GeoJSON();

  async searchSTAC(feature: any) {
    const geojson = this.format.writeFeatureObject(feature, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });

    // // Area Limit
    // const area = turf.area(geojson as any);
    // const areaKm2 = area / 1_000_000;
    
    // if (areaKm2 > 250) {
    //   throw new Error(`Area too large (${areaKm2.toFixed(2)} km²). Max 250 km² allowed.`);
    // }

    // 2. STAC Search
    const response = await fetch(this.STAC_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bbox: turf.bbox(geojson as any),
        collections: ['sentinel-2-l2a'],
        limit: 10,
        query: { "eo:cloud_cover": { "lt": 15 } }
      })
    });

    return await response.json();
  }
}
