import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { localToday } from '../../utils';

@Component({
  selector: 'app-emp-reg-form',
  imports: [FormsModule, RouterLink],
  template: `
    <h2 class="page-title">{{ editId ? 'Edit employee' : 'Register employee' }}</h2>

    <form class="card form-card" (ngSubmit)="save()">
      @if (error()) { <div class="alert alert-danger">{{ error() }}</div> }

      <div class="form-grid">
        <div>
          <label>Full name</label>
          <input name="name" [(ngModel)]="f.name" required>
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" [(ngModel)]="f.email" required>
        </div>
        <div>
          <label>{{ editId ? 'New password (leave empty to keep)' : 'Password' }}</label>
          <input type="password" name="password" [(ngModel)]="f.password" [required]="!editId" minlength="6">
        </div>
        <div>
          <label>Department</label>
          <input name="department" [(ngModel)]="f.department" required>
        </div>
        <div>
          <label>Role</label>
          <select name="role" [(ngModel)]="f.role">
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label>Monthly salary</label>
          <input type="number" name="salary" [(ngModel)]="f.salary" required min="0">
        </div>
        <div>
          <label>Joining date</label>
          <input type="date" name="joiningDate" [(ngModel)]="f.joiningDate" required>
        </div>
        <div>
          <label>Employment status</label>
          <select name="isActive" [(ngModel)]="f.isActive">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div class="row">
        <button class="btn btn-primary" [disabled]="saving()">{{ editId ? 'Save changes' : 'Register employee' }}</button>
        <a class="btn btn-ghost" routerLink="/employees">Cancel</a>
      </div>
    </form>
  `,
})
export class EmpRegFormComponent implements OnInit {
  private svc = inject(EmployeeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editId: number | null = null;
  error = signal('');
  saving = signal(false);

  f = {
    name: '', email: '', password: '', department: '',
    role: 'employee', salary: 30000, joiningDate: localToday(), isActive: 'active',
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    // edit mode: load the employee into the form
    this.editId = Number(id);
    this.svc.get(this.editId).subscribe((e) => {
      this.f = {
        name: e.name, email: e.email, password: '', department: e.department,
        role: e.role, salary: e.salary, joiningDate: e.joiningDate.slice(0, 10), isActive: e.isActive,
      };
    });
  }

  save() {
    this.error.set('');
    this.saving.set(true);

    const body: any = { ...this.f, salary: Number(this.f.salary) };
    if (this.editId && !body.password) delete body.password; // keep old password

    const request = this.editId ? this.svc.update(this.editId, body) : this.svc.create(body);
    request.subscribe({
      next: () => this.router.navigate(['/employees']),
      error: (e) => {
        this.error.set(e.error?.message || 'Could not save employee');
        this.saving.set(false);
      },
    });
  }
}
