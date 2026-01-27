import { Injectable, signal } from '@angular/core';
import { Map } from 'ol';
import { Select, Modify, Translate } from 'ol/interaction';
import { click } from 'ol/events/condition';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Stroke, Style } from 'ol/style';

@Injectable({
  providedIn: 'root',
})
export class EditingService {
  private _selectInteraction: Select | null = null;
  private _modifyInteraction: Modify | null = null;
  private _translateInteraction: Translate | null = null;

  isEditMode = signal<boolean>(false);

  startEditing(map: Map, source: VectorSource) {
    this.stopEditing(map); 

    this._selectInteraction = new Select({
      condition: click,
      layers: (layer) => layer.getSource() === source,
      style: new Style({
        fill: new Fill({ color: 'rgba(255, 255, 255, 0.3)' }),
        stroke: new Stroke({
          color: '#f97316', // Orange-500
          width: 3,
          lineDash: [4, 8]
        }),
        image: new Circle({
          radius: 6,
          fill: new Fill({ color: '#f97316' }),
          stroke: new Stroke({ color: '#fff', width: 2 })
        })
      })
    });

    this._modifyInteraction = new Modify({
      features: this._selectInteraction.getFeatures(),
    });

    this._translateInteraction = new Translate({
      features: this._selectInteraction.getFeatures(),
    });

    map.addInteraction(this._selectInteraction);
    map.addInteraction(this._modifyInteraction);
    map.addInteraction(this._translateInteraction);

    this.isEditMode.set(true);

    map.getTargetElement().style.cursor = 'pointer';
  }

  stopEditing(map: Map) {
    if (this._selectInteraction) {
      map.removeInteraction(this._selectInteraction);
      this._selectInteraction = null;
    }
    if (this._modifyInteraction) {
      map.removeInteraction(this._modifyInteraction);
      this._modifyInteraction = null;
    }
    if (this._translateInteraction) {
      map.removeInteraction(this._translateInteraction);
      this._translateInteraction = null;
    }

    this.isEditMode.set(false);
    map.getTargetElement().style.cursor = '';
  }
}
