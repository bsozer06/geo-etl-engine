import { Injectable } from '@angular/core';
import { LayerService } from './layer.service';
import { MapViewerService } from './map-viewer.service';
import { MapLayer } from '../models/map-layer.model';

@Injectable({
  providedIn: 'root',
})
export class LayerFacadeService {
  constructor(
    private layerService: LayerService,
    private mapService: MapViewerService
  ) {}

  add(layer: MapLayer) {
    this.mapService.addLayer(layer.layer);
    this.layerService.add(layer);
  }

  remove(layer: MapLayer) {
    this.mapService.removeLayer(layer.layer);
    this.layerService.remove(layer.id);
  }

  toggleVisibility(layer: MapLayer) {
    this.mapService.setVisibility(layer.layer, !layer.visible);
    this.layerService.toggleVisibility(layer.id);
  }

  zoom(layer: MapLayer) {
    this.mapService.zoomToLayer(layer.layer);
  }
}
