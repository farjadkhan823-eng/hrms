import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="login-wrap">
      <form class="card login-card" (ngSubmit)="submit()">
        <h1>Sign in to HRMS</h1>
        <p class="muted">Use your work email and password.</p>

        @if (error()) { <div class="alert alert-danger">{{ error() }}</div> }

        <label>Email</label>
        <input type="email" name="email" [(ngModel)]="email" required placeholder="you@company.com">

        <label>Password</label>
        <input type="password" name="password" [(ngModel)]="password" required placeholder="Your password">

        <button class="btn btn-primary btn-block" [disabled]="loading()">
          {{ loading() ? 'Signing in...' : 'Sign in' }}
        </button>

        <p class="hint">Demo admin: admin&#64;hrms.com / Admin&#64;123<br>Demo employee: ali&#64;hrms.com / Emp&#64;123</p>
      </form>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal('');
  loading = signal(false);

  constructor() {
    // already logged in, skip the login page
    if (this.auth.isLoggedIn()) this.goHome();
  }

  submit() {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.goHome(),
      error: (e) => {
        this.error.set(e.error?.message || 'Could not reach the server');
        this.loading.set(false);
      },
    });
  }

  private goHome() {
    this.router.navigate([this.auth.isAdmin() ? '/dashboard' : '/profile']);
  }
}
