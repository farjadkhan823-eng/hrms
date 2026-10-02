import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { User } from '../../models';

@Component({
  selector: 'app-emp-table',
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="page-head">
      <h2 class="page-title">Employees</h2>
      <a class="btn btn-primary" routerLink="/employees/new">Add employee</a>
    </div>

    <div class="card">
      <div class="filters">
        <input type="text" placeholder="Search by name, email or department" (input)="search.set($any($event.target).value)">
      </div>

      @if (error()) { <div class="alert alert-danger">{{ error() }}</div> }

      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Salary</th><th>Joined</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            @for (e of filtered(); track e.id) {
              <tr>
                <td>{{ e.name }}</td>
                <td>{{ e.email }}</td>
                <td>{{ e.role }}</td>
                <td>{{ e.department }}</td>
                <td>{{ e.salary | number }}</td>
                <td>{{ e.joiningDate | date: 'dd MMM yyyy' }}</td>
                <td><span class="badge badge-{{ e.isActive }}">{{ e.isActive }}</span></td>
                <td class="actions">
                  <a class="btn btn-small" [routerLink]="['/employees/edit', e.id]">Edit</a>
                  <button class="btn btn-small btn-danger" (click)="remove(e)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="empty">No employees found.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class EmpTableComponent implements OnInit {
  private svc = inject(EmployeeService);

  employees = signal<User[]>([]);
  search = signal('');
  error = signal('');

  // list after search text is applied
  filtered = computed(() => {
    const s = this.search().toLowerCase();
    return this.employees().filter(
      (e) => e.name.toLowerCase().includes(s) || e.email.toLowerCase().includes(s) || e.department.toLowerCase().includes(s)
    );
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc.list().subscribe((list) => this.employees.set(list));
  }

  remove(e: User) {
    if (!confirm(`Delete ${e.name}? Their attendance and salary records will be deleted too.`)) return;
    this.svc.remove(e.id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err.error?.message || 'Could not delete employee'),
    });
  }
}
