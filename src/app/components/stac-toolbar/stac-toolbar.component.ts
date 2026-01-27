import { Component, inject, ElementRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { StacPanelComponent } from '../stac-panel/stac-panel.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stac-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stac-toolbar.component.html',
  styleUrl: './stac-toolbar.component.scss',
})
export class StacToolbarComponent {
private overlay = inject(Overlay);
  private elementRef = inject(ElementRef);
  private overlayRef: OverlayRef | null = null;
  isOpen = false;

  togglePanel() {
    if (this.overlayRef?.hasAttached()) {
      this.overlayRef.detach();
      this.isOpen = false;
      return;
    }

    this.isOpen = true;
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions([{
        originX: 'center', originY: 'bottom',
        overlayX: 'center', overlayY: 'top',
        offsetY: 15
      }]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    this.overlayRef.attach(new ComponentPortal(StacPanelComponent));
  }
}
