import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard, employeeGuard } from './guards/role.guard';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmpTableComponent } from './components/emp-table/emp-table.component';
import { EmpRegFormComponent } from './components/emp-reg-form/emp-reg-form.component';
import { AttendanceFormComponent } from './components/attendance-form/attendance-form.component';
import { AttendanceTableComponent } from './components/attendance-table/attendance-table.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ViewSalaryComponent } from './components/view-salary/view-salary.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // admin only
  { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'employees', component: EmpTableComponent, canActivate: [adminGuard] },
  { path: 'employees/new', component: EmpRegFormComponent, canActivate: [adminGuard] },
  { path: 'employees/edit/:id', component: EmpRegFormComponent, canActivate: [adminGuard] },
  { path: 'salary', component: ViewSalaryComponent, canActivate: [adminGuard] },

  // employee only
  { path: 'profile', component: ProfileComponent, canActivate: [employeeGuard] },
  { path: 'my-salary', component: ViewSalaryComponent, canActivate: [employeeGuard] },

  // any logged in user (backend limits employee to own data)
  { path: 'attendance', component: AttendanceTableComponent, canActivate: [authGuard] },
  { path: 'attendance/mark', component: AttendanceFormComponent, canActivate: [authGuard] },

  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
