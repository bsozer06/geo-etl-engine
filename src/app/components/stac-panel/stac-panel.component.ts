import { Component, ElementRef, inject, signal } from '@angular/core';
import { StacService } from '../../services/stac.service';
import { MapViewerService } from '../../services/map-viewer.service';
import { DrawingService } from '../../services/drawing.service';
import { CommonModule } from '@angular/common';
import TileLayer from 'ol/layer/Tile';
import { GeoTIFF } from 'ol/source';
import { ComponentPortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import STAC, { Extent } from 'ol-stac';

@Component({
  selector: 'app-stac-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stac-panel.component.html',
  styleUrl: './stac-panel.component.scss',
})
export class StacPanelComponent {
  private drawService = inject(DrawingService);
  private stacService = inject(StacService);
  private mapService = inject(MapViewerService);

  results = signal<any[]>([]);
  loading = signal(false);

  initSearchArea() {
    const map = this.mapService.map();
    if (!map) return;

    this.drawService.startDrawing(map, 'Polygon', async (feature) => {
        try {
          this.loading.set(true);
          this.results.set([]);

          const data = await this.stacService.searchSTAC(feature);

          if (data && data.features) {
            this.results.set([...data.features]);
          }
        } catch (err: any) {
          console.error(err);
          alert(err.message);
        } finally {
          this.loading.set(false);
          this.drawService.clearDrawings();
        }
      });
  }

  displayLayer(item: any) {
    this.mapService.selectStacItem(item);
  }


}
