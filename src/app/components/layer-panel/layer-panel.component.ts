import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BasemapService } from '../../services/basemap.service';
import { LayerService } from '../../services/layer.service';
import { Basemap } from '../../models/basemap.model';
import { MapLayer } from '../../models/map-layer.model';
import { MapViewerService } from '../../services/map-viewer.service';

@Component({
  selector: 'app-layer-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './layer-panel.component.html',
  styleUrl: './layer-panel.component.scss',
})
export class LayerPanelComponent {
  basemapService = inject(BasemapService);
  layerService = inject(LayerService)
  mapViewerService = inject(MapViewerService);
  
  basemaps = this.basemapService.getBasemaps();
  layers = this.layerService.getLayers();
  activeBasemapId = this.basemapService.getActive();
  activeLayer = this.layerService.getActive();
  
  constructor(
  ) {}

  activateBasemap(bm: Basemap) {
    this.basemapService.activate(bm.id);
  }

  toggle(layer: MapLayer) {
    this.layerService.toggle(layer.id);
  }

  setActive(layer: MapLayer) {
    this.layerService.setActive(layer.id);
  }

  zoom(layer: MapLayer) {
    const extent = layer.layer.getSource()?.getExtent();
    if (extent) {
      this.mapViewerService.zoomToExtent(extent);
    }
  }

  remove(layer: MapLayer) {
    this.mapViewerService.removeLayer(layer.layer);
    this.layerService.remove(layer.id);
  }
}

