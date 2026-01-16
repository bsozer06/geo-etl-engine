import { CommonModule, KeyValuePipe } from '@angular/common';
import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { MapViewerService } from '../../services/map-viewer.service';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-map-context-menu',
  standalone: true,
  imports: [
    CommonModule,
    CdkDrag,
    CdkDragHandle],
  templateUrl: './map-context-menu.component.html',
  styleUrl: './map-context-menu.component.scss',
})
export class MapContextMenuComponent {
  mapService = inject(MapViewerService);
  filteredData: any;
  selectedFeatureData = signal<any>(null);
  private _el = inject(ElementRef);
  isWindowOpen = signal(false);

  constructor() {
    this.filteredData = computed(() => {
      const data = this.selectedFeatureData();

      if (!data || typeof data !== 'object') {
        return [];
      }

      const excludeKeys = ['geometry', 'ol_uid', 'clientX', 'clientY'];

      return Object.entries(data)
        .filter(([key]) => !excludeKeys.includes(key))
        .map(([key, value]) => ({
          key: String(key),
          value: value === null || value === undefined ? '---' : String(value)
        }));
    });
  }

  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    if (this.mapService.rightClickedFeature()) {
      if (!this._el.nativeElement.contains(event.target)) {
        this.mapService.rightClickedFeature.set(null);
      }
    }
  }

  openWindow(feature: any) {
    this.selectedFeatureData.set(feature);
    this.isWindowOpen.set(true);
    this.mapService.rightClickedFeature.set(null);
  }

  closeWindow() {
    this.isWindowOpen.set(false);
  }
}
