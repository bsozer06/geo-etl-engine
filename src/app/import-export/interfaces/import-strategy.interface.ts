import { ImportedGeoData } from '../../models/imported-geodata.model';

export interface ImportStrategy {
  readonly type: string;
  import(file: File): Promise<ImportedGeoData>;
}
