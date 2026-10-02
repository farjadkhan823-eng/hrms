import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SalaryService } from '../../services/salary.service';
import { SalaryRecord } from '../../models';
import { MONTHS } from '../../utils';

@Component({
  selector: 'app-view-salary',
  imports: [FormsModule, DecimalPipe],
  template: `
    <h2 class="page-title">{{ auth.isAdmin() ? 'Salary' : 'My salary' }}</h2>

    @if (auth.isAdmin()) {
      <div class="card">
        <h3>Generate monthly salary</h3>
        <div class="filters">
          <div>
            <label>Month</label>
            <select [(ngModel)]="month">
              @for (m of months; track m; let i = $index) { <option [ngValue]="i + 1">{{ m }}</option> }
            </select>
          </div>
          <div>
            <label>Year</label>
            <input type="number" [(ngModel)]="year">
          </div>
          <button class="btn btn-primary" (click)="generate()">Generate salary</button>
        </div>
        @if (message()) { <div class="alert alert-success">{{ message() }}</div> }
        @if (error()) { <div class="alert alert-danger">{{ error() }}</div> }
      </div>
    }

    @for (s of salaries(); track s.id) {
      <div class="card salary-card">
        <div class="salary-head">
          <div>
            <h3>{{ monthName(s.month) }} {{ s.year }}</h3>
            @if (auth.isAdmin()) { <span class="muted">{{ s.employee?.name }} - {{ s.employee?.department }}</span> }
          </div>
          <div class="net">
            <span class="muted">Net salary</span>
            <strong>{{ s.netSalary | number }}</strong>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Item</th><th>Count</th><th>Amount</th></tr></thead>
            <tbody>
              <tr><td>Base salary</td><td>-</td><td>{{ s.baseSalary | number }}</td></tr>
              <tr><td>Late days</td><td>{{ s.details?.lateCount }}</td><td class="cut">- {{ s.lateDeduction | number }}</td></tr>
              <tr><td>Absent days</td><td>{{ s.details?.absentCount }}</td><td class="cut">- {{ s.absentDeduction | number }}</td></tr>
              <tr><td>Off without leave</td><td>{{ s.details?.offWithoutLeaveCount }}</td><td class="muted">included below</td></tr>
              <tr><td>Leaves taken (extra after 2: {{ s.details?.extraLeaveCount }})</td><td>{{ s.details?.leaveCount }}</td><td class="cut">- {{ s.leaveDeduction | number }}</td></tr>
              <tr class="total-row"><td>Total deduction</td><td></td><td class="cut">- {{ s.totalDeductions | number }}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    } @empty {
      <div class="card"><p class="empty">No salary has been generated yet.</p></div>
    }
  `,
})
export class ViewSalaryComponent implements OnInit {
  auth = inject(AuthService);
  private svc = inject(SalaryService);

  months = MONTHS;
  salaries = signal<SalaryRecord[]>([]);
  message = signal('');
  error = signal('');

  month = new Date().getMonth() + 1;
  year = new Date().getFullYear();

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc.list().subscribe((list) => this.salaries.set(list));
  }

  generate() {
    this.message.set('');
    this.error.set('');
    this.svc.generate(Number(this.month), Number(this.year)).subscribe({
      next: (r) => {
        this.message.set(r.message);
        this.load();
      },
      error: (e) => this.error.set(e.error?.message || 'Could not generate salary'),
    });
  }

  monthName(m: number) {
    return MONTHS[m - 1];
  }
}
