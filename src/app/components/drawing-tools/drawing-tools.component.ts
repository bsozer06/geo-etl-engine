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

  private _dblClickListener: ((e: MouseEvent) => void) | null = null;

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
      this._removeDblClickListener(map);
    } else {
      this._drawService.startDrawing(map, type);
      this._addDblClickListener(map);
    }
    this.showMenu.set(false);
  }

  private _addDblClickListener(map: any) {
    this._removeDblClickListener(map);
    this._dblClickListener = (e: MouseEvent) => {
      if (e.button === 0 && this.activeType()) {
        this._drawService.stopDrawing(map);
        this._removeDblClickListener(map);
      }
    };
    map.getViewport().addEventListener('dblclick', this._dblClickListener);
  }

  private _removeDblClickListener(map: any) {
    if (this._dblClickListener) {
      map.getViewport().removeEventListener('dblclick', this._dblClickListener);
      this._dblClickListener = null;
    }
  }

}
