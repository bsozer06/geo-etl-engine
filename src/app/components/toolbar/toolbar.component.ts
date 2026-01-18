import { Component, inject, signal } from '@angular/core';
import { MapViewerService } from '../../services/map-viewer.service';
import { DrawingService } from '../../services/drawing.service';
import { CommonModule } from '@angular/common';
import { UploadComponent } from "../upload/upload.component";
import { DownloadComponent } from "../download/download.component";
import { DrawingToolsComponent } from "../drawing-tools/drawing-tools.component";
import { MapPrintComponent } from "../map-print/map-print.component";
import { StacPanelComponent } from "../stac-panel/stac-panel.component";
import { StacToolbarComponent } from "../stac-toolbar/stac-toolbar.component";

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule, UploadComponent, DownloadComponent, DrawingToolsComponent, MapPrintComponent, StacToolbarComponent],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  private _mapService = inject(MapViewerService);
  private _drawService = inject(DrawingService);
  showDrawMenu = signal(false);
  activeDrawType = this._drawService.activeType;

  toggleDrawMenu() {
    this.showDrawMenu.update(v => !v);
  }

  startDrawing(type: 'Point' | 'LineString' | 'Polygon' | null) {
    const map = this._mapService.map();
    if (!map) return;

    if (type === null) {
      this._drawService.stopDrawing(map);
    } else {
      this._drawService.startDrawing(map, type);
    }
    this.showDrawMenu.set(false);
  }

}
