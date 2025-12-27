import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

export class ProjectionHelper {
    private static _epsgCache = new Map<string, string>();

    public static getProjection(projCode: string): any {
        return proj4(projCode);
    }

    public static registerWktProjection(wkt: string): string {
        const normalizedWkt = wkt.replace(/\s+/g, ' ').trim();
        const cached = this._epsgCache.get(normalizedWkt);
        if (cached) {
            return cached;
        }
        const code = this._generateCode(normalizedWkt);

        if (!proj4.defs(code)) {
            proj4.defs(code, normalizedWkt);
            register(proj4);
        }

        this._epsgCache.set(normalizedWkt, code);
        return code;
    }

    public static transformPoint(point: [number, number], fromProj: string, toProj: string): [number, number] {
        const from = this.getProjection(fromProj);
        const to = this.getProjection(toProj);
        return proj4(from, to, point);
    }

    private static _generateCode(wkt: string): string {
        return `CUSTOM:${this._hash(wkt)}`;
    }

    private static _hash(input: string): string {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            hash = (hash << 5) - hash + input.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString();
    }

}