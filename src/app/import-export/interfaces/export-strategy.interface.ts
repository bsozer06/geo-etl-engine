
import { ImportedGeoData } from "../../models/imported-geodata.model";

export interface ExportStrategy {
  readonly type: string;
  export(data: ImportedGeoData): Blob;
}
