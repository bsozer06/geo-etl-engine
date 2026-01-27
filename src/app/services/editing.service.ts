import { Injectable, signal } from '@angular/core';
import { Map } from 'ol';
import { Select, Modify, Translate } from 'ol/interaction';
import { click } from 'ol/events/condition';
import VectorSource from 'ol/source/Vector';

@Injectable({
  providedIn: 'root',
})
export class EditingService {
  private _selectInteraction: Select | null = null;
  private _modifyInteraction: Modify | null = null;
  private _translateInteraction: Translate | null = null;

  isEditMode = signal<boolean>(false);

  startEditing(map: Map, source: VectorSource) {
    this.stopEditing(map); // Mevcut etkileşimleri temizle

    // 1. Seçim Etkileşimi: Sadece belirtilen kaynaktaki feature'ları seçebilir
    this._selectInteraction = new Select({
      condition: click,
      layers: (layer) => layer.getSource() === source,
    });

    // 2. Modifikasyon Etkileşimi: Seçili olan feature'ları düzenler
    this._modifyInteraction = new Modify({
      features: this._selectInteraction.getFeatures(),
    });

    // 3. Taşıma Etkileşimi: Şekli bir bütün olarak kaydırmak isterseniz
    this._translateInteraction = new Translate({
      features: this._selectInteraction.getFeatures(),
    });

    map.addInteraction(this._selectInteraction);
    map.addInteraction(this._modifyInteraction);
    map.addInteraction(this._translateInteraction);

    this.isEditMode.set(true);

    // Opsiyonel: İmleci değiştir
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
