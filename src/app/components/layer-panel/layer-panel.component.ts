import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
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
  mapService = inject(MapViewerService);

  basemaps = computed(() => {
    const map = this.mapService.getMap();
    if (!map) return [];
    const bm = map.getLayers().getArray().filter(l => l.get('type') === 'basemap');
    console.log('bm', bm);
    return bm;
  });

  layers = computed(() => {
    const map = this.mapService.getMap();
    if (!map) return [];
    const lyr = map.getLayers().getArray().filter(l => l.get('type') === 'vector');
    console.log('layers', lyr);
    return lyr;
  });

  
  // layerFacade = inject(LayerFacadeService);
  // basemaps = this.layerFacade.basemaps;
  // layers = this.layerFacade.layers;

  // activeBasemapId = this.layerFacade.activeBasemapId;

  // constructor() { }

  // setBasemap(id: string) {
  //   this.layerFacade.setBasemap(id);
  // }

  // toggleVisibility(layer: MapLayer) {
  //   this.layerFacade.toggleVisibility(layer);
  // }

  // zoomToLayer(layer: MapLayer) {
  //   this.layerFacade.zoom(layer);
  // }

  // removeLayer(layer: MapLayer) {
  //   this.layerFacade.remove(layer);
  // }

  // // setActiveLayer(id: string) {
  // //   this.layerFacade.setActiveLayer(id);
  // // }
}

