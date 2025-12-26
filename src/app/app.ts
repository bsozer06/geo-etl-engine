import { Component, signal } from '@angular/core';
import { MapViewerComponent } from './components/map-viewer/map-viewer.component';

@Component({
  selector: 'app-root',
  imports: [ MapViewerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('geo-etl-engine');
}
