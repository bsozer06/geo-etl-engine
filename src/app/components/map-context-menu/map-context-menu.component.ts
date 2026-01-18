import { CommonModule, KeyValuePipe } from '@angular/common';
import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { MapViewerService } from '../../services/map-viewer.service';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { GeoAnalysisHelper } from '../../helpers/geo-analysis.helper';
import Feature from 'ol/Feature';
import { Text as OLText, Style, Fill, Circle, Stroke } from 'ol/style';

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

  onMeasureClick(featureData: any) {
    try {
      const actualFeature = featureData?.feature;
      const source = this.mapService.getVectorSource();
      const type = actualFeature.getGeometry()?.getType();
      const existingMeasurements = source.getFeatures().filter(f => f.get('type') === 'measurement');
      existingMeasurements.forEach(f => source.removeFeature(f));

      const result = GeoAnalysisHelper.calculateMeasurement(actualFeature);

      let measurementPoint: Feature;
      if (type.includes('Polygon')) {
        measurementPoint = GeoAnalysisHelper.getCentroid(actualFeature);
      } else {
        measurementPoint = GeoAnalysisHelper.getLineMiddlePoint(actualFeature);
      }

      measurementPoint.set('type', 'measurement');

      measurementPoint.setStyle(new Style({
        text: new OLText({
          text: `${result.label}: ${result.value}`,
          font: 'bold 13px Inter, sans-serif',
          fill: new Fill({ color: '#ffffff' }),
          backgroundFill: new Fill({ color: '#334155' }),
          padding: [4, 8, 4, 8],
          offsetY: -20,
        }),
        image: new Circle({
          radius: 4,
          fill: new Fill({ color: '#334155' })
        })
      }));

      source.addFeature(measurementPoint);
      this.mapService.rightClickedFeature.set(null);
    } catch (error) {
      console.error("Measurement error:", error);
    }
  }

  onCentroidClick(data: any) {
    try {
      const actualFeature = data.feature;
      const source = this.mapService.getVectorSource();

      const allFeatures = source.getFeatures();
      const existingCentroids = allFeatures.filter(f => f.get('type') === 'centroid');
      existingCentroids.forEach(f => source.removeFeature(f));

      const centroidFeature = GeoAnalysisHelper.getCentroid(actualFeature);

      centroidFeature.set('type', 'centroid');
      centroidFeature.setStyle(new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({ color: '#ef4444' }),
          stroke: new Stroke({ color: '#fff', width: 2.5 })
        }),
        zIndex: 1000
      }));

      source.addFeature(centroidFeature);
      this.mapService.rightClickedFeature.set(null);
    } catch (error) {
      console.error("Centroid calculation error:", error);
    }
  }

  isPolygon(data: any): boolean {
    if (!data?.feature) return false;
    const type = data.feature.getGeometry()?.getType();
    return type === 'Polygon' || type === 'MultiPolygon';
  }

  isLine(data: any): boolean {
    if (!data?.feature) return false;
    const type = data.feature.getGeometry()?.getType();
    return type === 'LineString' || type === 'MultiLineString';
  }


}
