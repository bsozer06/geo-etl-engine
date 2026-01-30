import { Component, signal } from '@angular/core';
import { MapViewerComponent } from './components/map-viewer/map-viewer.component';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, MapViewerComponent, LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('geo-etl-engine');
  constructor(public auth: AuthService) {}
}
