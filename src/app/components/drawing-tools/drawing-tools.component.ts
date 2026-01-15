import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { DrawingService } from '../../services/drawing.service';
import { MapViewerService } from '../../services/map-viewer.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drawing-tools',
  imports: [CommonModule],
  templateUrl: './drawing-tools.component.html',
  styleUrl: './drawing-tools.component.scss',
})
export class DrawingToolsComponent {
  private _el = inject(ElementRef);
  private _drawService = inject(DrawingService);
  private _mapService = inject(MapViewerService);

  showMenu = signal(false);
  activeType = this._drawService.activeType;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this._el.nativeElement.contains(event.target)) {
      this.showMenu.set(false);
    }
  }

  toggleMenu() {
    this.showMenu.update(v => !v);
  }

  startDrawing(type: 'Point' | 'LineString' | 'Polygon' | null) {
    const map = this._mapService.map();
    if (!map) return;

    if (type === null) {
      this._drawService.stopDrawing(map);
    } else {
      this._drawService.startDrawing(map, type);
    }
    this.showMenu.set(false);
  }

}
