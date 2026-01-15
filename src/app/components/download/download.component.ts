import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { GeoDataService } from '../../services/geo-data.service';

@Component({
  selector: 'app-download',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './download.component.html',
  styleUrl: './download.component.scss',
})
export class DownloadComponent {
  private _el = inject(ElementRef); 
  private _geoDataService = inject(GeoDataService);

  showExportMenu = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this._el.nativeElement.contains(event.target)) {
      this.showExportMenu.set(false);
    }
  }

  toggleExportMenu() {
    this.showExportMenu.update(v => !v);
  }

   async export(format: string): Promise<void> {
    try {
      this.showExportMenu.set(false);
      if (format === 'kml' || format === 'gpx' || format === 'zip' || format === 'geojson') {
        const blob = await this._geoDataService.export(format);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert(err instanceof Error ? err.message : 'Export failed');
    }
  }

}
