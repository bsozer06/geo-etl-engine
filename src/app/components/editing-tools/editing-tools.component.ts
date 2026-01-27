import { Component, inject } from '@angular/core';
import { EditingService } from '../../services/editing.service';
import { DrawingService } from '../../services/drawing.service';
import { MapViewerService } from '../../services/map-viewer.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editing-tools',
  imports: [CommonModule],
  templateUrl: './editing-tools.component.html',
  styleUrl: './editing-tools.component.scss',
})
export class EditingToolsComponent {
  editingService = inject(EditingService);
  drawingService = inject(DrawingService);
  mapService = inject(MapViewerService);

  toggleEdit() {
    const map = this.mapService.map();
    const source = this.drawingService.source;

    if (!map || !source) {
      return;
    }

    if (this.editingService.isEditMode()) {
      this.editingService.stopEditing(map);
    } else {
      // Çizim modu açıksa kapatıyoruz ki çakışmasınlar
      this.drawingService.stopDrawing(map);
      this.editingService.startEditing(map, source);
    }
  }
}
