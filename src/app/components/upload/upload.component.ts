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
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.kml')) {
      this.geoDataService.importKml(file);
    }

    if (fileName.endsWith('.dxf')) {
      // this.geoDataService.importDxf(file);
      console.warn('DXF feature does not implemented !');
    }

    if (fileName.endsWith('.zip')) {
      this.geoDataService.importShp(file);
    }

  }


}
