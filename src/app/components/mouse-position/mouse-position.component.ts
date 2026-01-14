import { Component, effect } from '@angular/core';
import { MapViewerService } from '../../services/map-viewer.service';
import Map from 'ol/Map';
import { toLonLat } from 'ol/proj';
import { format } from 'ol/coordinate';

@Component({
  selector: 'app-mouse-position',
  standalone: true,
  imports: [],
  templateUrl: './mouse-position.component.html',
  styleUrl: './mouse-position.component.scss',
})
export class MousePositionComponent {  
  formattedCoords: string = '00.0000, 00.0000';
  private ticking = false;

  constructor(private _mapService: MapViewerService) {
    effect(() => {
      const mapInstance = this._mapService.map(); 

      if (mapInstance) {
        console.log('Map detected via Signal!');
        this.initPointerListener(mapInstance);
      }
    });
  }
  private initPointerListener(map: any): void {
    map.on('pointermove', (event: any) => {
     if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this._updateCoords(map, event.pixel);
          this.ticking = false;
        });
        this.ticking = true;
      }
    });
  }

  private _updateCoords(map: any, pixel: any): void {
    const coords = map.getCoordinateFromPixel(pixel);      
    if (coords) {
      const lonLat = toLonLat(coords);
      this.formattedCoords = format(lonLat, '{y}, {x}', 4);
    }
  }

}
