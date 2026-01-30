import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { DrawingService } from '../../services/drawing.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.component.html',
})
export class LoginComponent {
    private drawingService = inject(DrawingService);

    username = signal('');
    password = signal('');
    showInfo = signal(false);

    constructor(public auth: AuthService) { }

    onLogin(event: Event) {
        event.preventDefault();
        if (this.auth.login(this.username(), this.password())) {
            this.password.set('');
        }
    }

    onLogout() {
        this.auth.logout();
        this.drawingService.clearDrawings();
        this.drawingService.clearStacDrawings();
        this.showInfo.set(false);
    }
}
