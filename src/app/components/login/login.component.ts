import { Component, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.component.html',
})
export class LoginComponent {
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
}
