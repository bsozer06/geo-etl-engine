import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeoDataService } from '../../services/geo-data.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html'
})
export class UploadComponent {

  loading = false;
  error: string | null = null;

  constructor(private geoDataService: GeoDataService) { }

  async onFileSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.name.endsWith('.kml')) {
      this.geoDataService.importKml(file);
    }

    if (file.name.endsWith('.dxf')) {
      this.geoDataService.importDxf(file);
    }
    // const input = event.target as HTMLInputElement;
    // const file = input.files?.[0];

    // this.error = null;

    // if (!file) return;

    // if (!file.name.toLowerCase().endsWith('.kml')) {
    //   this.error = 'Only .kml files are supported';
    //   input.value = '';
    //   return;
    // }

    // this.loading = true;

    // try {
    //   await this.geoDataService.loadKml(file);
    // } catch {
    //   this.error = 'Failed to load KML file';
    // } finally {
    //   this.loading = false;
    //   input.value = '';
    // }
  }


}
