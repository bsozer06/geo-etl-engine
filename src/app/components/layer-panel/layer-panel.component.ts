import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BasemapService } from '../../services/basemap.service';
import { LayerService } from '../../services/layer.service';
import { Basemap } from '../../models/basemap.model';
import { MapLayer } from '../../models/maplayer.model';

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

  basemaps = this.basemapService.getBasemaps();
  layers = this.layerService.getLayers();
  activeBasemapId = this.basemapService.getActive();
  activeLayer = this.layerService.getActive();
  
  constructor(
    // private mapService: MapService
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
      this.mapService.zoomToExtent(extent);
    }
  }

  remove(layer: MapLayer) {
    this.mapService.removeLayer(layer.layer);
    this.layerService.remove(layer.id);
  }
}

