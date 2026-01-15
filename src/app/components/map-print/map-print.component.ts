import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { MapViewerService } from '../../services/map-viewer.service';
import Map from 'ol/Map';
import jsPDF from 'jspdf';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-print',
  imports: [CommonModule],
  templateUrl: './map-print.component.html',
  styleUrl: './map-print.component.scss',
})
export class MapPrintComponent {
  isExporting = false;
  showMenu = signal(false);
  private _el = inject(ElementRef);
  private _mapService = inject(MapViewerService);
  
  get map(): Map | null {
    return this._mapService.map();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this._el.nativeElement.contains(event.target)) {
      this.showMenu.set(false);
    }
  }

  toggleMenu() {
    this.showMenu.update(v => !v);
  }

  export(format: 'png' | 'pdf') {
    if (!this.map) return;
    this.isExporting = true;
    this.showMenu.set(false);

    // Give UI time to close menu before capturing
    setTimeout(() => {
      this.map?.once('rendercomplete', () => {
        const mapCanvas = document.createElement('canvas');
        const size = this.map?.getSize();
        if (!size) return;

        mapCanvas.width = size[0];
        mapCanvas.height = size[1];
        const mapContext = mapCanvas.getContext('2d')!;

        const canvases = document.querySelectorAll('.ol-layer canvas');
        canvases.forEach((canvas: any) => {
          if (canvas.width > 0) {
            const opacity = canvas.parentNode.style.opacity;
            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
            const transform = canvas.style.transform;
            const matrix = transform.match(/^matrix\(([^\(]*)\)$/)?.[1].split(',').map(Number);

            if (matrix) {
              mapContext.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
            }
            mapContext.drawImage(canvas, 0, 0);
          }
        });

        const dataUri = mapCanvas.toDataURL('image/png');
        if (format === 'png') this.downloadPNG(dataUri);
        else this.downloadPDF(dataUri, mapCanvas.width, mapCanvas.height);

        this.isExporting = false;
      });
      this.map?.renderSync();
    }, 100);
  }

  private downloadPNG(uri: string) {
    const link = document.createElement('a');
    link.href = uri;
    link.download = `map_${Date.now()}.png`;
    link.click();
  }

  private downloadPDF(uri: string, width: number, height: number) {
    const orientation = width > height ? 'l' : 'p';
    const pdf = new jsPDF(orientation, 'px', [width, height]);
    pdf.addImage(uri, 'PNG', 0, 0, width, height);
    pdf.save(`map_${Date.now()}.pdf`);
  }
}
