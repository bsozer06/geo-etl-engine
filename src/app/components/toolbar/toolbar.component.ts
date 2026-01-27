import { Component, inject, signal } from '@angular/core';
import { MapViewerService } from '../../services/map-viewer.service';
import { DrawingService } from '../../services/drawing.service';
import { CommonModule } from '@angular/common';
import { UploadComponent } from "../upload/upload.component";
import { DownloadComponent } from "../download/download.component";
import { DrawingToolsComponent } from "../drawing-tools/drawing-tools.component";
import { MapPrintComponent } from "../map-print/map-print.component";
import { StacPanelComponent } from "../stac-panel/stac-panel.component";
import { StacToolbarComponent } from "../stac-toolbar/stac-toolbar.component";
import { EditingService } from '../../services/editing.service';
import { EditingToolsComponent } from "../editing-tools/editing-tools.component";

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule, UploadComponent, DownloadComponent, DrawingToolsComponent, MapPrintComponent, StacToolbarComponent, EditingToolsComponent],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {

}
