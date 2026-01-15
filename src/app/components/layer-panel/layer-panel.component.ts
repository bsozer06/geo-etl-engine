import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Basemap } from '../../models/basemap.model';
import { MapLayer } from '../../models/map-layer.model';
import { MapViewerService } from '../../services/map-viewer.service';
import BaseLayer from 'ol/layer/Base';

@Component({
  selector: 'app-layer-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './layer-panel.component.html',
  styleUrl: './layer-panel.component.scss',
})
export class LayerPanelComponent {
  mapService = inject(MapViewerService);

  basemaps = computed(() => {
    const map = this.mapService.map();
    if (!map) return [];
    const bm = map.getLayers().getArray().filter(l => l.get('type') === 'basemap');
    console.log('bm', bm);
    return bm;
  });

  layers = this.mapService.vectorLayers;

  setBaseLayerVisibility(baseLayer: BaseLayer) {
    const layers = this.mapService.getLayersByType('basemap');
    layers.forEach(layer => {
      layer.setVisible(false);
    });
    baseLayer.setVisible(true);
   }

   toggleLayerVisibility(layer: BaseLayer) {
    const currentVisibility = layer.getVisible();
    layer.setVisible(!currentVisibility);    
   }
   
   zoomToLayer(layer: BaseLayer) {
    this.mapService.zoomToVectorLayer(layer);
   }

   removeLayer(layer: BaseLayer) {
    this.mapService.removeVectorLayer(layer);
   }


   getActiveBasemapName(): string {
  const active = this.basemaps().find(bm => bm.getVisible());
  return active ? active.get('name').replace('Stadia Maps ', '') : 'Select';
}

handleImageError(layer: any) {
  const defaultPath = 'assets/map-previews/osm.webp';
  
  if (layer.get('thumbnail') !== defaultPath) {
    layer.set('thumbnail', defaultPath);
  }
}
}

