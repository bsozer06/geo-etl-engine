import VectorLayer from "ol/layer/Vector";

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  type: 'import' | 'draw';
  layer: VectorLayer;
}