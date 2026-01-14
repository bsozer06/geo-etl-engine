// models/basemap.model.ts
import TileLayer from 'ol/layer/Tile';

export interface Basemap {
  id: string;
  name: string;
  layer: TileLayer;
}
