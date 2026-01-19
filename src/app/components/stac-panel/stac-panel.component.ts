import { ChangeDetectorRef, Component, ElementRef, inject, NgZone, signal } from '@angular/core';
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
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  results = signal<any[]>([]);
  loading = signal(false);

  initSearchArea() {
    const map = this.mapService.map();
    if (!map) return;

    this.drawService.startDrawing(map, 'Polygon', async (feature) => {
      this.zone.run(async () => {
        try {
          this.loading.set(true);
          this.results.set([]);

          const data = await this.stacService.searchSTAC(feature);

          if (data && data.features) {
            // this.results.set(data.features);
            console.log('Veri geldi:', data.features.length);
            this.results.set([...data.features]);
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          }
        } catch (err: any) {
          console.error(err);
          alert(err.message);
        } finally {
          this.loading.set(false);
          this.drawService.clearDrawings();
          this.cdr.detectChanges();
        }
      });
    });
  }

  displayLayer(item: any) {
    this.mapService.selectStacItem(item);
  }


}
