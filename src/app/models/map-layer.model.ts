import BaseLayer from 'ol/layer/Base';

export type LayerType = 'basemap' | 'vector';

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  type: LayerType;
  layer: BaseLayer;
}