import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

export class ProjectionHelper {

    public static getProjection(projCode: string): any {
        return proj4(projCode);
    }

    public static registerWktProjection(wkt: string): string {
        const code = `CUSTOM:${Date.now()}`;
        proj4.defs(code, wkt);
        register(proj4);
        return code;
    }

    public static transformPoint(point: [number, number], fromProj: string, toProj: string): [number, number] {
        const from = this.getProjection(fromProj);
        const to = this.getProjection(toProj);
        return proj4(from, to, point);
    }

}