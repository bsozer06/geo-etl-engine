import { Control } from 'ol/control';
import Map from 'ol/Map';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import { easeOut } from 'ol/easing';

export class AdvancedZoomControl extends Control {
    private levelDisplay: HTMLDivElement;
    private viewListenerKey: EventsKey | EventsKey[] | undefined;

    constructor(opt_options?: any) {
        const options = opt_options || {};

        const element = document.createElement('div');
        element.className = 'ol-zoom advanced-zoom ol-unselectable ol-control';

        const zoomInBtn = document.createElement('button');
        zoomInBtn.innerHTML = '+';

        const levelDisplay = document.createElement('div');
        levelDisplay.className = 'zoom-level-indicator';
        levelDisplay.innerHTML = '-';

        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.innerHTML = '-';

        element.appendChild(zoomInBtn);
        element.appendChild(levelDisplay);
        element.appendChild(zoomOutBtn);

        super({
            element: element,
            target: options.target,
        });

        this.levelDisplay = levelDisplay;

        zoomInBtn.onclick = () => this.handleZoom(1);
        zoomOutBtn.onclick = () => this.handleZoom(-1);
    }

    // Dokümandaki setMap override yöntemi
    override setMap(map: Map | null): void {
        // Önceki listener'ı temizle (Memory leak önleme)
        if (this.viewListenerKey) {
            unByKey(this.viewListenerKey);
        }

        super.setMap(map);

        if (map) {
            map.on('change:view', () => {
                this.setupViewListener(map);
            });

            this.setupViewListener(map);
        }
    }

    private setupViewListener(map: Map): void {
        if (this.viewListenerKey) unByKey(this.viewListenerKey);

        const view = map.getView();
        if (view) {
            this.viewListenerKey = view.on('change:resolution', () => {
                this.updateDisplay(map);
            });
            this.updateDisplay(map); 
        }
    }

    private updateDisplay(map: Map): void {
        const zoom = map.getView().getZoom();
        if (zoom !== undefined) {
            this.levelDisplay.innerHTML = zoom % 1 === 0 ? zoom.toString() : zoom.toFixed(1);
        }
    }

    private handleZoom(delta: number): void {
        const view = this.getMap()?.getView();
        if (view) {
            const currentZoom = view.getZoom();
            if (currentZoom !== undefined) {
                view.animate({
                    zoom: currentZoom + delta,
                    duration: 300,      // Biraz daha uzun süre
                    easing: easeOut     // Yumuşak duruş efekti
                });
            }
        }
    }
}