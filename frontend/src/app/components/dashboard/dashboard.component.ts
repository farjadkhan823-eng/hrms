import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData } from '../../models';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, DecimalPipe],
  template: `
    <h2 class="page-title">Dashboard</h2>

    @if (data(); as d) {
      <div class="stats">
        <div class="card stat"><span>Total employees</span><strong>{{ d.totalEmployees }}</strong></div>
        <div class="card stat stat-ok"><span>Present today</span><strong>{{ d.presentToday }}</strong></div>
        <div class="card stat stat-bad"><span>Absent today</span><strong>{{ d.absentToday }}</strong></div>
        <div class="card stat stat-warn"><span>Late today</span><strong>{{ d.lateToday }}</strong></div>
        <div class="card stat"><span>Monthly salary to pay</span><strong>{{ d.totalSalary | number }}</strong></div>
      </div>

      <div class="card">
        <h3>Today's attendance</h3>
        @if (d.todayAttendance.length === 0) {
          <p class="empty">Nobody has checked in yet today.</p>
        } @else {
          <div class="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Department</th><th>Check in</th><th>Check out</th><th>Punctuality</th></tr></thead>
              <tbody>
                @for (r of d.todayAttendance; track r.id) {
                  <tr>
                    <td>{{ r.employee?.name }}</td>
                    <td>{{ r.employee?.department }}</td>
                    <td>{{ r.checkIn ? (r.checkIn | date: 'hh:mm a') : '-' }}</td>
                    <td>{{ r.checkOut ? (r.checkOut | date: 'hh:mm a') : '-' }}</td>
                    <td><span class="badge badge-{{ r.punctuality }}">{{ r.punctuality }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    } @else {
      <p class="muted">Loading dashboard...</p>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private svc = inject(DashboardService);
  data = signal<DashboardData | null>(null);

  ngOnInit() {
    this.svc.get().subscribe((d) => this.data.set(d));
  }
}
