import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AttendanceService } from '../../services/attendance.service';
import { Attendance } from '../../models';
import { localToday } from '../../utils';

@Component({
  selector: 'app-attendance-table',
  imports: [FormsModule, DatePipe],
  template: `
    <h2 class="page-title">{{ auth.isAdmin() ? 'Attendance records' : 'My attendance' }}</h2>

    <div class="card">
      <div class="filters">
        <div>
          <label>Period</label>
          <select [ngModel]="filters['filter']" (ngModelChange)="set('filter', $event)">
            <option value="all">All</option>
            <option value="month">Month</option>
            <option value="week">This week</option>
          </select>
        </div>

        @if (filters['filter'] === 'month') {
          <div>
            <label>Month</label>
            <input type="month" [ngModel]="filters['month']" (ngModelChange)="set('month', $event)">
          </div>
        }

        <div>
          <label>Status</label>
          <select [ngModel]="filters['status']" (ngModelChange)="set('status', $event)">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label>Punctuality</label>
          <select [ngModel]="filters['punctuality']" (ngModelChange)="set('punctuality', $event)">
            <option value="">All</option>
            <option value="onTime">On time</option>
            <option value="late">Late</option>
            <option value="early">Early</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="off">Off</option>
          </select>
        </div>

        <div>
          <label>Off reason</label>
          <select [ngModel]="filters['offReason']" (ngModelChange)="set('offReason', $event)">
            <option value="">All</option>
            <option value="onDuty">On duty</option>
            <option value="onLeave">On leave</option>
            <option value="sickLeave">Sick leave</option>
            <option value="casualLeave">Casual leave</option>
            <option value="leaveNotGiven">Leave not given</option>
          </select>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              @if (auth.isAdmin()) { <th>Employee</th> }
              <th>Check in</th><th>Check out</th><th>Status</th><th>Punctuality</th><th>Off reason</th>
            </tr>
          </thead>
          <tbody>
            @for (r of records(); track r.id) {
              <tr>
                <td>{{ r.date.slice(0, 10) }}</td>
                @if (auth.isAdmin()) { <td>{{ r.employee?.name }}</td> }
                <td>{{ r.checkIn ? (r.checkIn | date: 'hh:mm a') : '-' }}</td>
                <td>{{ r.checkOut ? (r.checkOut | date: 'hh:mm a') : '-' }}</td>
                <td><span class="badge badge-{{ r.status }}">{{ r.status }}</span></td>
                <td><span class="badge badge-{{ r.punctuality }}">{{ r.punctuality }}</span></td>
                <td>{{ r.offReason || '-' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="empty">No attendance records for these filters.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AttendanceTableComponent implements OnInit {
  auth = inject(AuthService);
  private svc = inject(AttendanceService);

  records = signal<Attendance[]>([]);
  filters: Record<string, string> = {
    filter: 'all',
    month: localToday().slice(0, 7), // YYYY-MM
    status: '',
    punctuality: '',
    offReason: '',
  };

  ngOnInit() {
    this.load();
  }

  set(key: string, value: string) {
    this.filters[key] = value;
    this.load();
  }

  load() {
    const params: Record<string, string> = { filter: this.filters['filter'] };

    if (this.filters['filter'] === 'month' && this.filters['month']) {
      const [year, month] = this.filters['month'].split('-');
      params['year'] = year;
      params['month'] = String(Number(month));
    }
    ['status', 'punctuality', 'offReason'].forEach((k) => {
      if (this.filters[k]) params[k] = this.filters[k];
    });

    this.svc.list(params).subscribe((list) => this.records.set(list));
  }
}
