import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AttendanceService } from '../../services/attendance.service';
import { EmployeeService } from '../../services/employee.service';
import { Attendance, User } from '../../models';
import { localToday } from '../../utils';

@Component({
  selector: 'app-attendance-form',
  imports: [FormsModule, DatePipe],
  template: `
    <h2 class="page-title">{{ auth.isAdmin() ? 'Mark attendance' : 'Check in / out' }}</h2>

    @if (message()) { <div class="alert alert-success">{{ message() }}</div> }
    @if (error()) { <div class="alert alert-danger">{{ error() }}</div> }

    @if (!auth.isAdmin()) {
      <!-- employee: simple check in / check out buttons -->
      <div class="card form-card">
        <h3>Today, {{ today }}</h3>
        <p class="muted">
          Check in: {{ todayRecord()?.checkIn ? (todayRecord()!.checkIn | date: 'hh:mm a') : 'not yet' }}
          &nbsp;|&nbsp;
          Check out: {{ todayRecord()?.checkOut ? (todayRecord()!.checkOut | date: 'hh:mm a') : 'not yet' }}
        </p>
        @if (todayRecord(); as r) {
          <p>Punctuality: <span class="badge badge-{{ r.punctuality }}">{{ r.punctuality }}</span></p>
        }
        <div class="row">
          <button class="btn btn-primary" [disabled]="!!todayRecord()?.checkIn" (click)="act('checkIn')">Check in</button>
          <button class="btn btn-accent" [disabled]="!todayRecord()?.checkIn || !!todayRecord()?.checkOut" (click)="act('checkOut')">Check out</button>
        </div>
      </div>
    } @else {
      <!-- admin: manual entry for any employee -->
      <form class="card form-card" (ngSubmit)="saveManual()">
        <div class="form-grid">
          <div>
            <label>Employee</label>
            <select name="employeeId" [(ngModel)]="f.employeeId" required>
              <option value="">Select employee</option>
              @for (e of employees(); track e.id) { <option [value]="e.id">{{ e.name }} ({{ e.department }})</option> }
            </select>
          </div>
          <div>
            <label>Date</label>
            <input type="date" name="date" [(ngModel)]="f.date" required>
          </div>
          <div>
            <label>Check in time</label>
            <input type="time" name="checkIn" [(ngModel)]="f.checkIn">
          </div>
          <div>
            <label>Check out time</label>
            <input type="time" name="checkOut" [(ngModel)]="f.checkOut">
          </div>
          <div>
            <label>Off reason (only if no check in)</label>
            <select name="offReason" [(ngModel)]="f.offReason">
              <option value="">None (mark absent)</option>
              <option value="onDuty">On duty</option>
              <option value="onLeave">On leave</option>
              <option value="sickLeave">Sick leave</option>
              <option value="casualLeave">Casual leave</option>
              <option value="leaveNotGiven">Leave not given</option>
            </select>
          </div>
        </div>
        <p class="hint">Late after 10:15 AM. Check out before 5:00 PM is early. Sunday is always off.</p>
        <button class="btn btn-primary">Save attendance</button>
      </form>
    }
  `,
})
export class AttendanceFormComponent implements OnInit {
  auth = inject(AuthService);
  private attSvc = inject(AttendanceService);
  private empSvc = inject(EmployeeService);

  today = localToday();
  todayRecord = signal<Attendance | null>(null);
  employees = signal<User[]>([]);
  message = signal('');
  error = signal('');

  f = { employeeId: '', date: localToday(), checkIn: '', checkOut: '', offReason: '' };

  ngOnInit() {
    if (this.auth.isAdmin()) {
      this.empSvc.list().subscribe((l) => this.employees.set(l.filter((e) => e.role === 'employee')));
    } else {
      this.loadToday();
    }
  }

  // find today's record inside this week's list
  loadToday() {
    this.attSvc.list({ filter: 'week' }).subscribe((list) => {
      this.todayRecord.set(list.find((r) => r.date.slice(0, 10) === this.today) || null);
    });
  }

  act(action: 'checkIn' | 'checkOut') {
    this.message.set('');
    this.error.set('');
    this.attSvc.mark({ action }).subscribe({
      next: () => {
        this.message.set(action === 'checkIn' ? 'Checked in' : 'Checked out');
        this.loadToday();
      },
      error: (e) => this.error.set(e.error?.message || 'Could not save attendance'),
    });
  }

  saveManual() {
    this.message.set('');
    this.error.set('');
    const body = {
      employeeId: Number(this.f.employeeId),
      date: this.f.date,
      checkIn: this.f.checkIn,
      checkOut: this.f.checkOut,
      offReason: this.f.offReason || null,
    };
    this.attSvc.mark(body).subscribe({
      next: (r) => this.message.set(`Attendance saved as ${r.punctuality}`),
      error: (e) => this.error.set(e.error?.message || 'Could not save attendance'),
    });
  }
}
