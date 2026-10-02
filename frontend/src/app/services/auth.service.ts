import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API } from '../config';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // logged in user (kept in a signal)
  user = signal<User | null>(this.readUser());
  isAdmin = computed(() => this.user()?.role === 'admin');

  login(email: string, password: string) {
    return this.http
      .post<{ token: string; user: User }>(`${API}/auth/login`, { email, password })
      .pipe(
        // type is written by hand so TypeScript does not treat res as unknown
        tap((res: { token: string; user: User }) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.user.set(res.user);
        })
      );
  }

  me() {
    return this.http.get<User>(`${API}/auth/me`);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  private readUser(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
