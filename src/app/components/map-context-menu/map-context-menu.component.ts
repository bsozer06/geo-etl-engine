import { CommonModule, KeyValuePipe } from '@angular/common';
import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { MapViewerService } from '../../services/map-viewer.service';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { GeoAnalysisHelper } from '../../helpers/geo-analysis.helper';
import Feature from 'ol/Feature';
import { Fill, Stroke, Style } from 'ol/style';

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
  isWindowOpen = signal(false);

  private _el = inject(ElementRef);
  private bufferStyle = new Style({
    stroke: new Stroke({ color: '#4f46e5', width: 2 }),
    fill: new Fill({ color: 'rgba(79, 70, 229, 0.2)' })
  });

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

  onBufferClick(featureData: any) {
    const actualFeature = featureData.feature ? featureData.feature : featureData;
   const userInput = prompt("Enter buffer distance in meters:", "100");
    if (userInput === null || userInput.trim() === "") return;

    const distance = parseFloat(userInput);
    if (isNaN(distance) || distance <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    try {
      const bufferFeature = GeoAnalysisHelper.createBuffer(actualFeature, distance);
      bufferFeature.setStyle(this.bufferStyle);
      
      this.mapService.getVectorSource().addFeature(bufferFeature);
      this.mapService.rightClickedFeature.set(null);
    } catch (error) {
      console.error("Buffer error:", error);
    }
  }

  onMeasureClick(feature: Feature) {
    const result = GeoAnalysisHelper.calculateMeasurement(feature);
    console.log(`${result.type}: ${result.value.toFixed(2)} ${result.unit}`);
  }
}
