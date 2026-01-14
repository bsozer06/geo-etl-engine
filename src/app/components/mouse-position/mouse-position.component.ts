import { Component } from '@angular/core';
import { MapViewerService } from '../../services/map-viewer.service';
import Map from 'ol/Map';

@Component({
  selector: 'app-mouse-position',
  standalone: true,
  imports: [],
  templateUrl: './mouse-position.component.html',
  styleUrl: './mouse-position.component.scss',
})
export class MousePositionComponent {
  map: Map | null; 
  
  formattedCoords: string = '00.0000, 00.0000';

  constructor(mapService: MapViewerService) {
    this.map = mapService.map();
  }

  ngOnInit(): void {
    if (!this.map) return;

    // Harita üzerindeki fare hareketlerini dinle
    this.map.on('pointermove', (event) => {
      if (!this.map) return;
      const coords = this.map.getCoordinateFromPixel(event.pixel);
      if (coords) {
        // Harita projeksiyonunu (örn: EPSG:3857) standart coğrafi koordinata (EPSG:4323) dönüştür
        console.log(coords);
        
        // const lonLat = toLonLat(coords);
        // // Format: Enlem, Boylam (virgülden sonra 4 basamak)
        // this.formattedCoords = format(lonLat, '{y}, {x}', 4);
      }
    });
  }
}
