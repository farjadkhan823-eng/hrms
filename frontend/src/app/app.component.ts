import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout" [class.no-sidebar]="!auth.user()">
      @if (auth.user()) {
        <aside class="sidebar">
          <div class="brand">HRMS</div>
          <nav>
            @if (auth.isAdmin()) {
              <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
              <a routerLink="/employees" routerLinkActive="active">Employees</a>
              <a routerLink="/attendance" routerLinkActive="active">Attendance</a>
              <a routerLink="/attendance/mark" routerLinkActive="active">Mark attendance</a>
              <a routerLink="/salary" routerLinkActive="active">Salary</a>
            } @else {
              <a routerLink="/profile" routerLinkActive="active">My profile</a>
              <a routerLink="/attendance/mark" routerLinkActive="active">Check in / out</a>
              <a routerLink="/attendance" routerLinkActive="active">My attendance</a>
              <a routerLink="/my-salary" routerLinkActive="active">My salary</a>
            }
          </nav>
        </aside>
      }

      <div class="main">
        @if (auth.user(); as u) {
          <header class="topbar">
            <span>{{ u.name }} <small class="muted">({{ u.role }})</small></span>
            <div class="row">
              <button class="btn btn-ghost" (click)="theme.toggle()">
                {{ theme.theme() === 'dark' ? 'Light mode' : 'Dark mode' }}
              </button>
              <button class="btn btn-danger" (click)="auth.logout()">Logout</button>
            </div>
          </header>
        } @else {
          <div class="theme-float">
            <button class="btn btn-ghost" (click)="theme.toggle()">
              {{ theme.theme() === 'dark' ? 'Light mode' : 'Dark mode' }}
            </button>
          </div>
        }
        <main class="content"><router-outlet /></main>
      </div>
    </div>
  `,
})
export class AppComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
}
