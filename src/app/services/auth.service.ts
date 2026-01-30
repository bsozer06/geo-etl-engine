import { Injectable, signal, WritableSignal, effect } from '@angular/core';

export interface DemoUser {
  username: string;
  role: 'admin' | 'user';
  info?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user: WritableSignal<(DemoUser & { token?: string }) | null> = signal(null);

  readonly user = this._user.asReadonly();

  private readonly STORAGE_KEY = 'geo-auth-demo-user';

  readonly demoUsers: DemoUser[] = [
    {
      username: 'admin',
      role: 'admin',
      info: 'Full access. Can manage all data and settings.'
    },
    {
      username: 'user',
      role: 'user',
      info: 'Limited access. Can view and export data only.'
    }
  ];


  constructor() {
    // Load session from localStorage
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.username && parsed.token) {
          this._user.set(parsed);
        }
      } catch {}
    }

    // Save session to localStorage on user change
    effect(() => {
      const user = this._user();
      if (user) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    });
  }

  login(username: string, password: string): boolean {
    // Demo: Select user from demoUsers
    const found = this.demoUsers.find(u => u.username === username);
    if (found) {
      // Create a new user object with a fake token on each login
      const user = { ...found, token: this.generateToken() };
      this._user.set(user);
      return true;
    }
    return false;
  }

  logout(): void {
    this._user.set(null);
  }

  private generateToken(): string {
    // Simple fake token
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
