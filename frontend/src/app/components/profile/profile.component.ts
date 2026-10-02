import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SalaryService } from '../../services/salary.service';
import { SalaryRecord, User } from '../../models';
import { MONTHS } from '../../utils';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <h2 class="page-title">My profile</h2>

    <!-- one alert for every generated salary month -->
    @for (s of salaries(); track s.id) {
      <div class="alert alert-info">
        Your salary for {{ monthName(s.month) }} {{ s.year }} is generated.
        <a routerLink="/my-salary">View salary</a>
      </div>
    }

    @if (user(); as u) {
      <div class="card">
        <div class="profile-grid">
          <div><span class="muted">Name</span><strong>{{ u.name }}</strong></div>
          <div><span class="muted">Email</span><strong>{{ u.email }}</strong></div>
          <div><span class="muted">Department</span><strong>{{ u.department }}</strong></div>
          <div><span class="muted">Monthly salary</span><strong>{{ u.salary | number }}</strong></div>
          <div><span class="muted">Joining date</span><strong>{{ u.joiningDate | date: 'dd MMM yyyy' }}</strong></div>
          <div><span class="muted">Status</span><span class="badge badge-{{ u.isActive }}">{{ u.isActive }}</span></div>
        </div>
      </div>
    }
  `,
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private salarySvc = inject(SalaryService);

  user = signal<User | null>(null);
  salaries = signal<SalaryRecord[]>([]);

  ngOnInit() {
    this.auth.me().subscribe((u) => this.user.set(u));
    this.salarySvc.list().subscribe((l) => this.salaries.set(l));
  }

  monthName(m: number) {
    return MONTHS[m - 1];
  }
}
